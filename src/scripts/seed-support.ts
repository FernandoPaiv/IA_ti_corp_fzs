import { PrismaClient } from '@prisma/client';

const SEED_CONFIRMATION = 'CREATE_AUTH_USER_AND_MEMBERSHIP';
const PAGE_SIZE = 1000;

interface SupabaseAdminUser {
  id: string;
  email?: string;
}

interface SeedConfig {
  supabaseUrl: URL;
  serviceRoleKey: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function requireSeedConfirmation(): void {
  if (process.env.SEED_CONFIRMATION !== SEED_CONFIRMATION) {
    throw new Error(`Set SEED_CONFIRMATION=${SEED_CONFIRMATION} to explicitly authorize user creation.`);
  }
}

function readConfig(): SeedConfig {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const expectedUrl = process.env.SEED_EXPECTED_SUPABASE_URL?.trim();
  if (!rawUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for user seeds.');
  }
  if (!expectedUrl) {
    throw new Error('SEED_EXPECTED_SUPABASE_URL is required to confirm the Supabase project.');
  }
  let supabaseUrl: URL;
  try {
    supabaseUrl = new URL(rawUrl);
  } catch {
    throw new Error('SUPABASE_URL must be a valid URL.');
  }
  const loopback = ['localhost', '127.0.0.1'].includes(supabaseUrl.hostname);
  if (
    (supabaseUrl.protocol !== 'https:' && !(loopback && supabaseUrl.protocol === 'http:')) ||
    supabaseUrl.pathname !== '/' ||
    supabaseUrl.username ||
    supabaseUrl.password ||
    supabaseUrl.search ||
    supabaseUrl.hash
  ) {
    throw new Error('User seeds require an HTTPS Supabase project origin (HTTP is allowed only on localhost).');
  }
  let parsedExpectedUrl: URL;
  try {
    parsedExpectedUrl = new URL(expectedUrl);
  } catch {
    throw new Error('SEED_EXPECTED_SUPABASE_URL must be a valid project URL.');
  }
  if (parsedExpectedUrl.origin !== supabaseUrl.origin) {
    throw new Error('SEED_EXPECTED_SUPABASE_URL does not match SUPABASE_URL; no user was created.');
  }
  return { supabaseUrl, serviceRoleKey };
}

async function adminRequest(
  config: SeedConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(new URL(path, config.supabaseUrl), {
      ...init,
      signal: AbortSignal.timeout(10_000),
      headers: {
        apikey: config.serviceRoleKey,
        authorization: `Bearer ${config.serviceRoleKey}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Supabase Auth Admin API is unavailable or timed out.');
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error('Supabase Auth Admin API returned invalid JSON.');
  }
}

async function findUser(config: SeedConfig, email: string): Promise<SupabaseAdminUser | null> {
  const matches: SupabaseAdminUser[] = [];
  for (let page = 1; page <= 200; page += 1) {
    const response = await adminRequest(
      config,
      `/auth/v1/admin/users?page=${page}&per_page=${PAGE_SIZE}`,
    );
    if (!response.ok) {
      throw new Error(`Supabase Auth Admin API list-users request failed with HTTP ${response.status}.`);
    }
    const body = await readJson(response);
    if (!isRecord(body) || !Array.isArray(body.users)) {
      throw new Error('Supabase Auth Admin API returned an unexpected users response.');
    }
    for (const value of body.users) {
      if (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.email === 'string' &&
        value.email.toLowerCase() === email
      ) {
        matches.push({ id: value.id, email: value.email });
      }
    }
    if (matches.length > 1) {
      throw new Error('More than one Supabase Auth user matched the configured email.');
    }
    if (body.users.length < PAGE_SIZE) return matches[0] ?? null;
  }
  throw new Error('User search exceeded its safe pagination limit.');
}

export async function ensureAuthUser(
  emailValue: string,
  password: string | undefined,
  fullName: string,
  tenantId: string,
): Promise<string> {
  requireSeedConfirmation();
  const email = emailValue.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('The seed email is invalid.');
  }

  const config = readConfig();
  const existing = await findUser(config, email);
  if (existing) return existing.id;
  if (!password || password.length < 12) {
    throw new Error('A new Supabase Auth user requires a password with at least 12 characters.');
  }

  const response = await adminRequest(config, '/auth/v1/admin/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { tenant_id: tenantId },
    }),
  });
  if (!response.ok) {
    if (response.status === 422) {
      const createdByAnotherRun = await findUser(config, email);
      if (createdByAnotherRun) return createdByAnotherRun.id;
    }
    throw new Error(`Supabase Auth Admin API create-user request failed with HTTP ${response.status}.`);
  }
  const body = await readJson(response);
  const user = isRecord(body) && isRecord(body.user) ? body.user : body;
  if (!isRecord(user) || typeof user.id !== 'string') {
    throw new Error('Supabase Auth Admin API did not return a user ID.');
  }
  return user.id;
}

export async function ensureTenant(prisma: PrismaClient): Promise<string> {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'suporte_ti' },
    update: {},
    create: { slug: 'suporte_ti', name: 'Suporte de TI' },
    select: { id: true },
  });
  return tenant.id;
}

export async function ensureMembership(
  prisma: PrismaClient,
  userId: string,
  tenantId: string,
  role: 'admin' | 'colaborador',
): Promise<void> {
  const existing = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    select: { role: true },
  });
  if (existing) {
    if (existing.role !== role) {
      throw new Error(`Existing membership has role "${existing.role}" instead of "${role}"; no change was made.`);
    }
    return;
  }
  await prisma.membership.create({ data: { userId, tenantId, role } });
}

export async function runUserSeed(
  email: string,
  password: string | undefined,
  fullName: string,
  role: 'admin' | 'colaborador',
): Promise<void> {
  requireSeedConfirmation();
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is required for user seeds.');
  }
  const expectedDatabaseHost = process.env.SEED_EXPECTED_DATABASE_HOST?.trim();
  if (!expectedDatabaseHost) {
    throw new Error('SEED_EXPECTED_DATABASE_HOST is required to confirm the database destination.');
  }
  let databaseUrl: URL;
  try {
    databaseUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (databaseUrl.hostname.toLowerCase() !== expectedDatabaseHost.toLowerCase()) {
    throw new Error('SEED_EXPECTED_DATABASE_HOST does not match DATABASE_URL; no user was created.');
  }
  readConfig();

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const tenantId = await ensureTenant(prisma);
    const userId = await ensureAuthUser(email, password, fullName, tenantId);
    await ensureMembership(prisma, userId, tenantId, role);
    console.info(`[seed] user and ${role} membership ensured for ${fullName}; no operational data created.`);
  } finally {
    await prisma.$disconnect();
  }
}
