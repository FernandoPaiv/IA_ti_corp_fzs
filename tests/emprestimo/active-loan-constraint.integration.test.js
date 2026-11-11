const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
let tenantId;
let equipmentId;

beforeAll(async () => {
  await prisma.$connect();
  const tenant = await prisma.tenant.create({
    data: {
      slug: `qa-${randomUUID()}`,
      name: 'Isolated loan constraint test',
    },
  });
  tenantId = tenant.id;

  const equipment = await prisma.equipment.create({
    data: {
      tenantId,
      name: 'QA concurrent equipment',
      category: 'notebook',
      patrimony: `QA-${randomUUID()}`,
      status: 'disponivel',
    },
  });
  equipmentId = equipment.id;
});

afterAll(async () => {
  if (tenantId) {
    await prisma.loan.deleteMany({ where: { tenantId } });
    await prisma.equipment.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
  }
  await prisma.$disconnect();
});

test('allows only one open loan for concurrent inserts of the same equipment', async () => {
  const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const createLoan = (userId) =>
    prisma.loan.create({
      data: {
        tenantId,
        equipmentId,
        userId,
        borrowedAt: new Date(),
        dueAt,
      },
    });

  const results = await Promise.allSettled([
    createLoan(randomUUID()),
    createLoan(randomUUID()),
  ]);
  const fulfilled = results.filter((result) => result.status === 'fulfilled');
  const rejected = results.filter((result) => result.status === 'rejected');

  expect(fulfilled).toHaveLength(1);
  expect(rejected).toHaveLength(1);
  expect(rejected[0].reason.code).toBe('P2002');
  await expect(
    prisma.loan.count({ where: { equipmentId, returnedAt: null } }),
  ).resolves.toBe(1);
});
