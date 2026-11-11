/** Seed idempotente do tenant inicial. Não cria usuários nem dados operacionais. */
import { PrismaClient } from '@prisma/client';

function confirmSeedTarget(): void {
  if (process.env.TENANT_SEED_CONFIRMATION !== 'ENSURE_INITIAL_TENANT') {
    throw new Error('Set TENANT_SEED_CONFIRMATION=ENSURE_INITIAL_TENANT to authorize the tenant seed.');
  }
  const expectedHost = process.env.SEED_EXPECTED_DATABASE_HOST?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!expectedHost || !databaseUrl) {
    throw new Error('SEED_EXPECTED_DATABASE_HOST and DATABASE_URL are required for the tenant seed.');
  }
  let actualHost: string;
  try {
    actualHost = new URL(databaseUrl).hostname;
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (actualHost.toLowerCase() !== expectedHost.toLowerCase()) {
    throw new Error('SEED_EXPECTED_DATABASE_HOST does not match DATABASE_URL; no tenant was created.');
  }
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  confirmSeedTarget();
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'suporte_ti' },
    update: {},
    create: { slug: 'suporte_ti', name: 'Suporte de TI' },
  });
  console.log(`[seed] tenant "${tenant.slug}" ensured; no operational data created.`);
}

main()
  .catch((err) => {
    console.error('[seed] falhou:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
