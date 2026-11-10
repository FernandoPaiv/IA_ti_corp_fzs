const { randomUUID } = require('node:crypto');
const { createLoanTestContext } = require('./test-context');

let context;
let tenantB;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  if (tenantB) {
    await context.prisma.loan.deleteMany({ where: { tenantId: tenantB.id } });
    await context.prisma.equipment.deleteMany({ where: { tenantId: tenantB.id } });
    await context.prisma.membership.deleteMany({ where: { tenantId: tenantB.id } });
    await context.prisma.tenant.delete({ where: { id: tenantB.id } });
  }
  await context?.cleanup();
});

test('usuário de um tenant não acessa equipamentos ou empréstimos de outro tenant', async () => {
  const userA = await context.createUser();
  tenantB = await context.prisma.tenant.create({
    data: { slug: `qa-tenant-b-${randomUUID()}`, name: 'Isolated tenant B' },
  });
  const userB = await context.createUser('colaborador', tenantB.id);
  const equipmentB = await context.createEquipment(tenantB.id, 'emprestado');
  const loanB = await context.createLoan(tenantB.id, equipmentB.id, userB.id);

  await context.api.post(`/v1/emprestimos/solicitar/${equipmentB.id}`)
    .set('authorization', `Bearer ${userA.token}`)
    .expect(404);

  const loansA = await context.api.get('/v1/emprestimos/meus')
    .set('authorization', `Bearer ${userA.token}`)
    .expect(200);
  expect(loansA.body.emprestimos.map((loan) => loan.id)).not.toContain(loanB.id);

  const loansB = await context.api.get('/v1/emprestimos/meus')
    .set('authorization', `Bearer ${userB.token}`)
    .expect(200);
  expect(loansB.body.emprestimos.map((loan) => loan.id)).toContain(loanB.id);
});
