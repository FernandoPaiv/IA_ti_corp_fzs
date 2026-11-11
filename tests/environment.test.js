const { validateEnvironment } = require('../dist/config/environment');

const validEnvironment = {
  DATABASE_URL: 'postgresql://qa:qa@localhost:55432/qa_test',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY: 'qa-anon-key',
  FRONTEND_ORIGIN: 'http://localhost:5173',
};

describe('startup environment validation', () => {
  test('requires production-critical environment variables', () => {
    expect(() => validateEnvironment({})).toThrow(
      'DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, FRONTEND_ORIGIN',
    );
  });

  test('allows optional Pixabay and derives the Supabase JWKS endpoint', () => {
    const config = validateEnvironment(validEnvironment);
    expect(config.jwksUri).toBe('http://127.0.0.1:54321/auth/v1/.well-known/jwks.json');
    expect(config.frontendOrigins).toEqual(['http://localhost:5173']);
  });

  test('rejects a JWKS endpoint outside the configured Supabase project', () => {
    expect(() => validateEnvironment({
      ...validEnvironment,
      JWKS_URI: 'https://attacker.example/jwks.json',
    })).toThrow('JWKS_URI must be the standard Supabase Auth JWKS endpoint');
  });

  test('rejects non-HTTPS production origins', () => {
    expect(() => validateEnvironment({
      ...validEnvironment,
      FRONTEND_ORIGIN: 'http://frontend.example',
    })).toThrow('FRONTEND_ORIGIN must use HTTPS');
  });
});
