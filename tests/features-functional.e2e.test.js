const { randomUUID, generateKeyPairSync, sign } = require('node:crypto');
const http = require('node:http');
const { NestFactory } = require('@nestjs/core');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { ProblemDetailsFilter } = require('../dist/http/problem-details.filter');

jest.setTimeout(30000);

const prisma = new PrismaClient();
const keyId = 'qa-functional-test-key';

let app;
let supabaseServer;
let supabaseUrl;
let issuer;
let api;
let privateKey;
let publicJwk;
let tenantA;
let tenantB;
let userA;
let userB;
let userOtherTenant;
let userForLimit;
let userOverdue;
let userMultiTenant;
let equipmentA;
let equipmentOtherTenant;
let authTokenA;
let authTokenB;
let authTokenOtherTenant;
let authTokenForLimit;
let authTokenOverdue;

async function createEquipment(tenantId, name, status = 'disponivel') {
  return prisma.equipment.create({
    data: {
      tenantId,
      name,
      category: 'notebook',
      patrimony: `QA-${randomUUID()}`,
      status,
    },
  });
}

async function createMembership(userId, tenantId, role = 'colaborador') {
  return prisma.membership.create({ data: { userId, tenantId, role } });
}

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createToken(userId, tenantId, email = `${userId}@qa.test`, lifetimeSeconds = 300) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = {
    email,
    sub: userId,
    aud: 'authenticated',
    iss: issuer,
    iat: issuedAt,
    exp: issuedAt + lifetimeSeconds,
  };
  if (tenantId) claims.tenant_id = tenantId;
  const signingInput = `${encodeJwtPart({ alg: 'RS256', kid: keyId })}.${encodeJwtPart(claims)}`;
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url');
  return `${signingInput}.${signature}`;
}

function installExternalServiceMocks() {
  const nativeFetch = global.fetch;
  global.fetch = jest.fn(async (input, init) => {
    const rawUrl = typeof input === 'string' || input instanceof URL ? input : input.url;
    const url = new URL(rawUrl);
    if (url.hostname === 'pixabay.com' && url.pathname === '/api/') {
      return new Response(JSON.stringify({
        hits: [{
          id: 12345,
          largeImageURL: 'https://pixabay.com/get/qa-equipment.jpg',
          user: 'qa-photographer',
          pageURL: 'https://pixabay.com/photos/qa-equipment-12345/',
        }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return nativeFetch(input, init);
  });
}

beforeAll(async () => {
  process.env.SUPABASE_ANON_KEY = 'qa-anon-key';
  process.env.PIXABAY_API_KEY = 'qa-pixabay-key';
  await prisma.$connect();

  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  privateKey = keys.privateKey;
  publicJwk = keys.publicKey.export({ format: 'jwk' });
  publicJwk.kid = keyId;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  supabaseServer = http.createServer((req, res) => {
    const path = new URL(req.url, 'http://127.0.0.1').pathname;
    if (req.method === 'GET' && path === '/auth/v1/.well-known/jwks.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ keys: [publicJwk] }));
      return;
    }
    if (req.method === 'POST' && path === '/auth/v1/token') {
      let rawBody = '';
      req.setEncoding('utf8');
      req.on('data', (part) => { rawBody += part; });
      req.on('end', () => {
        const body = JSON.parse(rawBody || '{}');
        if (body.email === 'invalid@qa.test') {
          res.writeHead(400, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_grant' }));
          return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          access_token: authTokenA,
          refresh_token: 'qa-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
        }));
      });
      return;
    }
    if (req.method === 'POST' && path === '/auth/v1/logout') {
      res.writeHead(204).end();
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise((resolve) => supabaseServer.listen(0, '127.0.0.1', resolve));
  supabaseUrl = `http://127.0.0.1:${supabaseServer.address().port}`;
  issuer = `${supabaseUrl}/auth/v1`;
  process.env.SUPABASE_URL = supabaseUrl;

  tenantA = await prisma.tenant.create({
    data: { slug: `qa-a-${randomUUID()}`, name: 'Functional test tenant A' },
  });
  tenantB = await prisma.tenant.create({
    data: { slug: `qa-b-${randomUUID()}`, name: 'Functional test tenant B' },
  });

  userA = randomUUID();
  userB = randomUUID();
  userOtherTenant = randomUUID();
  userForLimit = randomUUID();
  userOverdue = randomUUID();
  userMultiTenant = randomUUID();
  await Promise.all([
    createMembership(userA, tenantA.id, 'admin'),
    createMembership(userB, tenantA.id),
    createMembership(userOtherTenant, tenantB.id),
    createMembership(userForLimit, tenantA.id),
    createMembership(userOverdue, tenantA.id),
    createMembership(userMultiTenant, tenantA.id),
    createMembership(userMultiTenant, tenantB.id),
  ]);

  equipmentA = await createEquipment(tenantA.id, 'QA equipment A');
  equipmentOtherTenant = await createEquipment(tenantB.id, 'QA equipment B');
  authTokenA = createToken(userA, tenantA.id);
  authTokenB = createToken(userB, tenantA.id);
  authTokenOtherTenant = createToken(userOtherTenant, tenantB.id);
  authTokenForLimit = createToken(userForLimit, tenantA.id);
  authTokenOverdue = createToken(userOverdue, tenantA.id);
  installExternalServiceMocks();

  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.init();
  api = request(app.getHttpServer());
});

afterAll(async () => {
  if (tenantA) {
    await prisma.loan.deleteMany({ where: { tenantId: tenantA.id } });
    await prisma.equipment.deleteMany({ where: { tenantId: tenantA.id } });
    await prisma.membership.deleteMany({ where: { tenantId: tenantA.id } });
    await prisma.tenant.delete({ where: { id: tenantA.id } });
  }
  if (tenantB) {
    await prisma.loan.deleteMany({ where: { tenantId: tenantB.id } });
    await prisma.equipment.deleteMany({ where: { tenantId: tenantB.id } });
    await prisma.membership.deleteMany({ where: { tenantId: tenantB.id } });
    await prisma.tenant.delete({ where: { id: tenantB.id } });
  }
  if (app) await app.close();
  await prisma.$disconnect();
  if (supabaseServer) {
    await new Promise((resolve, reject) => {
      supabaseServer.close((error) => error ? reject(error) : resolve());
    });
  }
});

describe('authenticated feature flows against local QA PostgreSQL', () => {
  test('login, refresh, authenticated logout, and protected routes work', async () => {
    const login = await api.post('/v1/auth/login')
      .send({ email: 'qa-user@qa.test', password: 'qa-password' })
      .expect(201);
    expect(login.body.access_token).toBe(authTokenA);
    expect(login.body.refresh_token).toBe('qa-refresh-token');

    await api.post('/v1/auth/refresh')
      .send({ refresh_token: 'qa-refresh-token' })
      .expect(201);
    await api.post('/v1/auth/login')
      .send({ email: 'invalid@qa.test', password: 'wrong-password' })
      .expect(401);
    const protectedResponse = await api.get('/v1/equipamentos')
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(200);
    expect(protectedResponse.body.equipments.map((item) => item.id)).toContain(equipmentA.id);
    expect(protectedResponse.body.equipments.map((item) => item.id)).not.toContain(equipmentOtherTenant.id);

    await api.post('/v1/auth/logout')
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(201)
      .expect({ success: true });

    const unauthorized = await api.get('/v1/equipamentos').expect(401);
    expect(unauthorized.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(unauthorized.body.status).toBe(401);
    await api.get('/v1/equipamentos')
      .set('authorization', 'Bearer invalid.token.value')
      .expect(401);
    const expiredToken = createToken(userA, tenantA.id, undefined, -1);
    await api.get('/v1/equipamentos')
      .set('authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  test('tenant context is derived from signed token or a unique membership, never request input', async () => {
    const noTenantClaimToken = createToken(userA, undefined);
    const uniqueMembership = await api.get('/v1/equipamentos')
      .set('authorization', `Bearer ${noTenantClaimToken}`)
      .expect(200);
    expect(uniqueMembership.body.equipments.map((item) => item.id)).toContain(equipmentA.id);

    const ambiguousToken = createToken(userMultiTenant, undefined);
    await api.get('/v1/equipamentos')
      .set('authorization', `Bearer ${ambiguousToken}`)
      .expect(401);

    const borrowResponse = await api.post(`/v1/emprestimos/solicitar/${equipmentA.id}`)
      .set('authorization', `Bearer ${authTokenA}`)
      .send({ userId: userB, tenantId: tenantB.id })
      .expect(201);
    expect(borrowResponse.body.userId).toBe(userA);
    expect(borrowResponse.body.tenantId).toBe(tenantA.id);
    await api.post(`/v1/emprestimos/${borrowResponse.body.id}/devolver`)
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(201);
  });

  test('Pixabay search results can be safely associated with the selected tenant equipment', async () => {
    const results = await api.get('/v1/equipamentos/imagens/busca?q=notebook')
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(200);
    expect(results.body).toEqual([{
      sourceId: '12345',
      imageUrl: 'https://pixabay.com/get/qa-equipment.jpg',
      photographer: 'qa-photographer',
      pageUrl: 'https://pixabay.com/photos/qa-equipment-12345/',
    }]);

    await api.patch(`/v1/equipamentos/${equipmentA.id}/imagem`)
      .set('authorization', `Bearer ${authTokenA}`)
      .send(results.body[0])
      .expect(200);
    const savedImage = await prisma.equipment.findUnique({ where: { id: equipmentA.id } });
    expect(savedImage.imageUrl).toBe(results.body[0].imageUrl);
    expect(savedImage.imageSourceId).toBe('12345');
    expect(savedImage.imagePhotographer).toBe('qa-photographer');
    expect(savedImage.imagePageUrl).toBe(results.body[0].pageUrl);

    await api.patch(`/v1/equipamentos/${equipmentA.id}/imagem`)
      .set('authorization', `Bearer ${authTokenA}`)
      .send({ ...results.body[0], imageUrl: 'http://127.0.0.1/private' })
      .expect(400);
    await api.patch(`/v1/equipamentos/${equipmentA.id}/imagem`)
      .set('authorization', `Bearer ${authTokenA}`)
      .send(null)
      .expect(400);
    await api.patch('/v1/equipamentos/not-a-uuid/imagem')
      .set('authorization', `Bearer ${authTokenA}`)
      .send(results.body[0])
      .expect(400);
    await api.patch(`/v1/equipamentos/${equipmentOtherTenant.id}/imagem`)
      .set('authorization', `Bearer ${authTokenA}`)
      .send(results.body[0])
      .expect(404);
  });

  test('loan limit, overdue block, unavailable equipment, and tenant isolation are enforced', async () => {
    const limitEquipment = await Promise.all([
      createEquipment(tenantA.id, 'QA limit 1'),
      createEquipment(tenantA.id, 'QA limit 2'),
      createEquipment(tenantA.id, 'QA limit 3'),
      createEquipment(tenantA.id, 'QA limit 4'),
    ]);
    for (const equipment of limitEquipment.slice(0, 3)) {
      await api.post(`/v1/emprestimos/solicitar/${equipment.id}`)
        .set('authorization', `Bearer ${authTokenForLimit}`)
        .expect(201);
    }
    const limitError = await api.post(`/v1/emprestimos/solicitar/${limitEquipment[3].id}`)
      .set('authorization', `Bearer ${authTokenForLimit}`)
      .expect(409);
    expect(limitError.body.detail).toContain('Limite máximo de 3');

    const overdueEquipment = await createEquipment(tenantA.id, 'QA overdue existing', 'emprestado');
    const overdueRequestEquipment = await createEquipment(tenantA.id, 'QA overdue request');
    await prisma.loan.create({
      data: {
        tenantId: tenantA.id,
        equipmentId: overdueEquipment.id,
        userId: userOverdue,
        borrowedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });
    const overdueError = await api.post(`/v1/emprestimos/solicitar/${overdueRequestEquipment.id}`)
      .set('authorization', `Bearer ${authTokenOverdue}`)
      .expect(409);
    expect(overdueError.body.detail).toContain('empréstimo atrasado');

    const maintenanceEquipment = await createEquipment(tenantA.id, 'QA maintenance', 'manutencao');
    await api.post(`/v1/emprestimos/solicitar/${maintenanceEquipment.id}`)
      .set('authorization', `Bearer ${authTokenB}`)
      .expect(409);
    await api.post(`/v1/emprestimos/solicitar/${equipmentOtherTenant.id}`)
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(404);

    const otherTenantLoan = await prisma.loan.create({
      data: {
        tenantId: tenantB.id,
        equipmentId: equipmentOtherTenant.id,
        userId: userOtherTenant,
        borrowedAt: new Date(),
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    const tenantALoans = await api.get('/v1/emprestimos/meus')
      .set('authorization', `Bearer ${authTokenA}`)
      .expect(200);
    expect(tenantALoans.body.emprestimos.map((loan) => loan.id)).not.toContain(otherTenantLoan.id);
    const tenantBLoans = await api.get('/v1/emprestimos/meus')
      .set('authorization', `Bearer ${authTokenOtherTenant}`)
      .expect(200);
    expect(tenantBLoans.body.emprestimos.map((loan) => loan.id)).toContain(otherTenantLoan.id);
  });

  test('concurrent requests cannot borrow one item twice and return restores availability', async () => {
    const concurrentEquipment = await createEquipment(tenantA.id, 'QA concurrent equipment');
    const attempts = await Promise.all([
      api.post(`/v1/emprestimos/solicitar/${concurrentEquipment.id}`)
        .set('authorization', `Bearer ${authTokenA}`),
      api.post(`/v1/emprestimos/solicitar/${concurrentEquipment.id}`)
        .set('authorization', `Bearer ${authTokenB}`),
    ]);
    expect(attempts.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await prisma.loan.count({
      where: { tenantId: tenantA.id, equipmentId: concurrentEquipment.id, returnedAt: null },
    })).toBe(1);

    const successfulAttempt = attempts.find((response) => response.status === 201);
    const ownerToken = successfulAttempt.body.userId === userA ? authTokenA : authTokenB;
    await api.post(`/v1/emprestimos/${successfulAttempt.body.id}/devolver`)
      .set('authorization', `Bearer ${ownerToken}`)
      .expect(201);
    const returnedEquipment = await prisma.equipment.findUnique({
      where: { id: concurrentEquipment.id },
    });
    expect(returnedEquipment.status).toBe('disponivel');
    await api.post(`/v1/emprestimos/${successfulAttempt.body.id}/devolver`)
      .set('authorization', `Bearer ${ownerToken}`)
      .expect(404);
  });
});
