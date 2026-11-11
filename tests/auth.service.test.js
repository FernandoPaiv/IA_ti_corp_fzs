const { generateKeyPairSync, randomUUID, sign } = require('node:crypto');
const http = require('node:http');
const { AuthService } = require('../dist/modules/auth/auth.service');

const keyId = 'auth-unit-test-key';
let server;
let service;
let privateKey;
let tenantId;
let userId;
let oldEnvironment;

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function makeToken(claims = {}) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    email: 'user@qa.test',
    aud: 'authenticated',
    iss: `${process.env.SUPABASE_URL}/auth/v1`,
    iat: issuedAt,
    exp: issuedAt + 300,
    ...claims,
  };
  const input = `${encodeJwtPart({ alg: 'RS256', kid: keyId })}.${encodeJwtPart(payload)}`;
  const signature = sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url');
  return `${input}.${signature}`;
}

beforeAll(async () => {
  oldEnvironment = {
    supabaseUrl: process.env.SUPABASE_URL,
    jwksUri: process.env.JWKS_URI,
    anonKey: process.env.SUPABASE_ANON_KEY,
  };
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  privateKey = keys.privateKey;
  const publicJwk = keys.publicKey.export({ format: 'jwk' });
  publicJwk.kid = keyId;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  server = http.createServer((req, res) => {
    if (req.url === '/auth/v1/.well-known/jwks.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ keys: [publicJwk] }));
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  process.env.SUPABASE_URL = baseUrl;
  process.env.JWKS_URI = `${baseUrl}/auth/v1/.well-known/jwks.json`;
  process.env.SUPABASE_ANON_KEY = 'qa-only-key';

  tenantId = randomUUID();
  userId = randomUUID();
});

afterAll(async () => {
  if (oldEnvironment.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = oldEnvironment.supabaseUrl;
  if (oldEnvironment.jwksUri === undefined) delete process.env.JWKS_URI;
  else process.env.JWKS_URI = oldEnvironment.jwksUri;
  if (oldEnvironment.anonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
  else process.env.SUPABASE_ANON_KEY = oldEnvironment.anonKey;
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

beforeEach(() => {
  const prisma = {
    membership: {
      findMany: jest.fn(async ({ where }) => (
        where.userId === userId && where.tenantId === tenantId
          ? [{ tenantId, role: 'colaborador' }]
          : []
      )),
    },
  };
  service = new AuthService(prisma);
});

describe('AuthService tenant claim validation', () => {
  test('accepts a signed tenant claim only when the user has that membership', async () => {
    await expect(service.authenticate(makeToken({ tenant_id: tenantId }))).resolves.toMatchObject({
      sub: userId,
      tenantId,
      role: 'colaborador',
    });
  });

  test('rejects a token without tenant_id', async () => {
    await expect(service.authenticate(makeToken())).rejects.toMatchObject({ status: 401 });
  });

  test('rejects a tenant claim without a matching membership', async () => {
    await expect(service.authenticate(makeToken({ tenant_id: randomUUID() })))
      .rejects.toMatchObject({ status: 401 });
  });
});
