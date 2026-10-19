/**
 * Seed idempotente (ADR-001 §5, AGENTS_DB.md).
 *
 * Cria o tenant inicial `suporte_ti` e popula alguns dados de demonstracao
 * (equipamentos + empréstimos) para a tela "Dados do banco" mostrar algo real.
 * Roda várias vezes sem erro (upsert / condicionado a vazio).
 * Executar com: `npx prisma db seed` (após `prisma migrate`).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Tenant inicial do produto. `slug` é a chave estável.
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'suporte_ti' },
    update: {},
    create: { slug: 'suporte_ti', name: 'Suporte de TI' },
  });
  console.log('[seed] tenant "suporte_ti" garantido.');

  // Dados de demo — upsert por (tenant_id, patrimony): idempotente mesmo se o
  // seed cair no meio de uma execução anterior.
  const eqData = [
    {
      name: 'Notebook Dell Latitude 5450',
      category: 'notebook',
      patrimony: 'TI-0142',
      status: 'disponivel',
      notes: null,
    },
    { name: 'Monitor LG 27" 4K', category: 'monitor', patrimony: 'TI-0231', status: 'disponivel', notes: null },
    {
      name: 'Monitor Dell 24" FHD',
      category: 'monitor',
      patrimony: 'TI-0233',
      status: 'manutencao',
      notes: 'Painel com falha, retorna em 05/09',
    },
  ] as const;

  const byPatrimony: Record<string, { id: string }> = {};
  for (const e of eqData) {
    const row = await prisma.equipment.upsert({
      where: { tenantId_patrimony: { tenantId: tenant.id, patrimony: e.patrimony } },
      update: {},
      create: { tenantId: tenant.id, ...e },
    });
    byPatrimony[e.patrimony] = { id: row.id };
  }

  // Empréstimos de demo: só cria se ainda não houver nenhum para esse equipamento.
  const activeLoanExists = await prisma.loan.findFirst({
    where: { tenantId: tenant.id, equipmentId: byPatrimony['TI-0142'].id, returnedAt: null },
  });
  const now = new Date();
  if (!activeLoanExists) {
    await prisma.loan.create({
      data: {
        tenantId: tenant.id,
        equipmentId: byPatrimony['TI-0142'].id,
        userId: '00000000-0000-4000-8000-000000000001', // demo (Supabase Auth fora do escopo)
        borrowedAt: now,
        dueAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    // 1 empréstimo já devolvido (para mostrar "total" vs "em aberto").
    await prisma.loan.create({
      data: {
        tenantId: tenant.id,
        equipmentId: byPatrimony['TI-0231'].id,
        userId: '00000000-0000-4000-8000-000000000001',
        borrowedAt: now,
        dueAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        returnedAt: now,
      },
    });
    console.log('[seed] dados de demo criados (3 equipamentos, 2 empréstimos).');
  } else {
    console.log('[seed] empréstimo de demo já existe — nada a fazer.');
  }
}

main()
  .catch((err) => {
    console.error('[seed] falhou:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


main()
  .catch((err) => {
    console.error('[seed] falhou:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
