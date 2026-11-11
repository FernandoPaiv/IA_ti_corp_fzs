const { randomUUID, generateKeyPairSync, sign } = require('node:crypto');
const http = require('node:http');
const { NestFactory } = require('@nestjs/core');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const { AppModule } = require('../../dist/app.module');
const { ProblemDetailsFilter } = require('../../dist/http/problem-details.filter');

const keyId = 'qa-loan-test-key';
let issuer;

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createToken(privateKey, userId, tenantId) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const signingInput = `${encodeJwtPart({ alg: 'RS256', kid: keyId })}.${encodeJwtPart({
    sub: userId,
    email: `${userId}@qa.test`,
    tenant_id: tenantId,
    aud: 'authenticated',
    iss: issuer,
    iat: issuedAt,
    exp: issuedAt + 300,
  })}`;
  return `${signingInput}.${sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url')}`;
}

async function createLoanTestContext() {
  const oldConfig = {
    supabaseUrl: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    jwksUri: process.env.JWKS_URI,
  };
  process.env.SUPABASE_ANON_KEY = 'qa-only-key';

  const prisma = new PrismaClient();
  await prisma.$connect();
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicJwk = keys.publicKey.export({ format: 'jwk' });
  publicJwk.kid = keyId;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  const supabaseServer = http.createServer((req, res) => {
    const path = new URL(req.url, 'http://127.0.0.1').pathname;
    if (req.method === 'GET' && path === '/auth/v1/.well-known/jwks.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ keys: [publicJwk] }));
      return;
    }
    if (req.method === 'POST' && path === '/auth/v1/token') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        access_token: 'qa-access-token',
        refresh_token: 'qa-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
      }));
      return;
    }
    if (req.method === 'POST' && path === '/auth/v1/logout') {
      res.writeHead(204).end();
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise((resolve) => supabaseServer.listen(0, '127.0.0.1', resolve));
  const supabaseUrl = `http://127.0.0.1:${supabaseServer.address().port}`;
  issuer = `${supabaseUrl}/auth/v1`;
  process.env.SUPABASE_URL = supabaseUrl;
  process.env.JWKS_URI = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

  const tenant = await prisma.tenant.create({
    data: { slug: `qa-loan-${randomUUID()}`, name: 'Isolated loan test tenant' },
  });
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.init();

  async function createUser(role = 'colaborador', userTenantId = tenant.id) {
    const userId = randomUUID();
    await prisma.membership.create({
      data: { userId, tenantId: userTenantId, role },
    });
    return { id: userId, token: createToken(keys.privateKey, userId, userTenantId) };
  }

  async function createEquipment(tenantId = tenant.id, status = 'disponivel') {
    return prisma.equipment.create({
      data: {
        tenantId,
        name: `QA equipment ${randomUUID()}`,
        category: 'notebook',
        patrimony: `QA-${randomUUID()}`,
        status,
      },
    });
  }

  async function createLoan(tenantId, equipmentId, userId, dueAt = new Date(Date.now() + 14 * 86400000)) {
    return prisma.loan.create({
      data: {
        tenantId,
        equipmentId,
        userId,
        borrowedAt: new Date(),
        dueAt,
      },
    });
  }

  return {
    api: request(app.getHttpServer()),
    prisma,
    tenant,
    createUser,
    createEquipment,
    createLoan,
    async cleanup() {
      await prisma.loan.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.equipment.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.membership.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.tenant.delete({ where: { id: tenant.id } });
      await app.close();
      await prisma.$disconnect();
      await new Promise((resolve, reject) => {
        supabaseServer.close((error) => error ? reject(error) : resolve());
      });
      if (oldConfig.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = oldConfig.supabaseUrl;
      if (oldConfig.anonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
      else process.env.SUPABASE_ANON_KEY = oldConfig.anonKey;
      if (oldConfig.jwksUri === undefined) delete process.env.JWKS_URI;
      else process.env.JWKS_URI = oldConfig.jwksUri;
    },
  };
}

module.exports = { createLoanTestContext };
