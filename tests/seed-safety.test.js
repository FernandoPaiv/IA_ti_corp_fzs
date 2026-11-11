const {
  requireSeedConfirmation,
  runUserSeed,
} = require('../dist/scripts/seed-support');

const variableNames = [
  'SEED_CONFIRMATION',
  'SEED_EXPECTED_SUPABASE_URL',
  'SEED_EXPECTED_DATABASE_HOST',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const originalEnvironment = Object.fromEntries(
  variableNames.map((name) => [name, process.env[name]]),
);

afterAll(() => {
  for (const name of variableNames) {
    if (originalEnvironment[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnvironment[name];
  }
});

describe('seed target safety', () => {
  test('requires deliberate confirmation before user creation', () => {
    delete process.env.SEED_CONFIRMATION;
    expect(() => requireSeedConfirmation()).toThrow('CREATE_AUTH_USER_AND_MEMBERSHIP');
  });

  test('rejects a project mismatch before opening the database connection', async () => {
    process.env.SEED_CONFIRMATION = 'CREATE_AUTH_USER_AND_MEMBERSHIP';
    process.env.SEED_EXPECTED_SUPABASE_URL = 'https://expected.supabase.co';
    process.env.SEED_EXPECTED_DATABASE_HOST = '127.0.0.1';
    process.env.DATABASE_URL = 'postgresql://qa:qa@127.0.0.1:55432/qa_test';
    process.env.SUPABASE_URL = 'https://different.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'qa-only-placeholder';

    await expect(runUserSeed(
      'qa@example.test',
      'never-used-test-password',
      'QA',
      'colaborador',
    )).rejects.toThrow('SEED_EXPECTED_SUPABASE_URL does not match SUPABASE_URL');
  });
});
