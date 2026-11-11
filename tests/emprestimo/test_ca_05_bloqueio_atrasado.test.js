const { createLoanTestContext } = require('./test-context');

let context;

beforeAll(async () => {
  context = await createLoanTestContext();
});

afterAll(async () => {
  await context?.cleanup();
});

test('bloqueia usuário com empréstimo atrasado e permite usuário em dia', async () => {
  const overdueUser = await context.createUser();
  const oldEquipment = await context.createEquipment(context.tenant.id, 'emprestado');
  await context.createLoan(
    context.tenant.id,
    oldEquipment.id,
    overdueUser.id,
    new Date(Date.now() - 86400000),
  );
  const requestEquipment = await context.createEquipment();
  const blocked = await context.api.post(`/v1/emprestimos/solicitar/${requestEquipment.id}`)
    .set('authorization', `Bearer ${overdueUser.token}`)
    .expect(409);
  expect(blocked.body.detail).toContain('empréstimo atrasado');

  const eligibleUser = await context.createUser();
  const currentEquipment = await context.createEquipment(context.tenant.id, 'emprestado');
  await context.createLoan(
    context.tenant.id,
    currentEquipment.id,
    eligibleUser.id,
    new Date(Date.now() + 86400000),
  );
  const secondEquipment = await context.createEquipment();
  await context.api.post(`/v1/emprestimos/solicitar/${secondEquipment.id}`)
    .set('authorization', `Bearer ${eligibleUser.token}`)
    .expect(201);
});
