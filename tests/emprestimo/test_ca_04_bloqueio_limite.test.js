const { createLoanTestContext } = require('./test-context');

let context;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  await context?.cleanup();
});

test('bloqueia o quarto empréstimo aberto e permite novo pedido abaixo do limite', async () => {
  const cappedUser = await context.createUser();
  for (let index = 0; index < 3; index += 1) {
    const equipment = await context.createEquipment(context.tenant.id, 'emprestado');
    await context.createLoan(context.tenant.id, equipment.id, cappedUser.id);
  }
  const fourthEquipment = await context.createEquipment();
  const blocked = await context.api.post(`/v1/emprestimos/solicitar/${fourthEquipment.id}`)
    .set('authorization', `Bearer ${cappedUser.token}`)
    .expect(409);
  expect(blocked.body.detail).toContain('Limite máximo de 3');

  const eligibleUser = await context.createUser();
  const existingEquipment = await context.createEquipment(context.tenant.id, 'emprestado');
  await context.createLoan(context.tenant.id, existingEquipment.id, eligibleUser.id);
  const availableEquipment = await context.createEquipment();
  await context.api.post(`/v1/emprestimos/solicitar/${availableEquipment.id}`)
    .set('authorization', `Bearer ${eligibleUser.token}`)
    .expect(201);
});
