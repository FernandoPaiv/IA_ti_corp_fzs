const { createLoanTestContext } = require('./test-context');

let context;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  await context?.cleanup();
});

test('solicita equipamento disponível, calcula prazo de 14 dias e atualiza seu status', async () => {
  const user = await context.createUser();
  const equipment = await context.createEquipment();

  const response = await context.api.post(`/v1/emprestimos/solicitar/${equipment.id}`)
    .set('authorization', `Bearer ${user.token}`)
    .expect(201);

  expect(response.body.userId).toBe(user.id);
  expect(response.body.tenantId).toBe(context.tenant.id);
  const actualDays = (
    new Date(response.body.dueAt).getTime() -
    new Date(response.body.borrowedAt).getTime()
  ) / 86400000;
  expect(actualDays).toBe(14);
  await expect(context.prisma.equipment.findUnique({ where: { id: equipment.id } }))
    .resolves.toMatchObject({ status: 'emprestado' });
});
