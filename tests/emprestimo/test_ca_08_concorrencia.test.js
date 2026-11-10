const { createLoanTestContext } = require('./test-context');

let context;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  await context?.cleanup();
});

test('solicitações simultâneas não criam dois empréstimos para o mesmo equipamento', async () => {
  const firstUser = await context.createUser();
  const secondUser = await context.createUser();
  const equipment = await context.createEquipment();

  const responses = await Promise.all([
    context.api.post(`/v1/emprestimos/solicitar/${equipment.id}`)
      .set('authorization', `Bearer ${firstUser.token}`),
    context.api.post(`/v1/emprestimos/solicitar/${equipment.id}`)
      .set('authorization', `Bearer ${secondUser.token}`),
  ]);
  expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
  await expect(context.prisma.loan.count({
    where: { tenantId: context.tenant.id, equipmentId: equipment.id, returnedAt: null },
  })).resolves.toBe(1);
});
