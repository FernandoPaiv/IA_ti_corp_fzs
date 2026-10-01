/**
 * Seed idempotente (ADR-001 §5, AGENTS_DB.md).
 *
 * Cria o tenant inicial `suporte_ti`. Roda várias vezes sem erro (upsert).
 * Executar com: `npx prisma db seed` (após `prisma migrate`).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Tenant inicial do produto. `slug` é a chave estável.
  await prisma.tenant.upsert({
    where: { slug: 'suporte_ti' },
    update: {},
    create: {
      slug: 'suporte_ti',
      name: 'Suporte de TI',
    },
  });

  console.log('[seed] tenant "suporte_ti" garantido.');
}

main()
  .catch((err) => {
    console.error('[seed] falhou:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
