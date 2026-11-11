const { createLoanTestContext } = require('./test-context');

let context;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  await context?.cleanup();
});

test('bloqueia equipamento em manutenção ou emprestado e permite equipamento disponível', async () => {
  const user = await context.createUser();
  const maintenanceEquipment = await context.createEquipment(context.tenant.id, 'manutencao');
  const maintenanceResponse = await context.api.post(
    `/v1/emprestimos/solicitar/${maintenanceEquipment.id}`,
  ).set('authorization', `Bearer ${user.token}`).expect(409);
  expect(maintenanceResponse.body.detail).toContain('manutencao');

  const borrowedEquipment = await context.createEquipment(context.tenant.id, 'emprestado');
  const otherUser = await context.createUser();
  await context.createLoan(context.tenant.id, borrowedEquipment.id, otherUser.id);
  await context.api.post(`/v1/emprestimos/solicitar/${borrowedEquipment.id}`)
    .set('authorization', `Bearer ${user.token}`)
    .expect(409);

  const availableEquipment = await context.createEquipment();
  await context.api.post(`/v1/emprestimos/solicitar/${availableEquipment.id}`)
    .set('authorization', `Bearer ${user.token}`)
    .expect(201);
});
