-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "patrimony" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "returned_at" TIMESTAMPTZ(6),
    "created_by" UUID,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key","window_start")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "memberships_tenant_id_idx" ON "memberships"("tenant_id");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_tenant_id_key" ON "memberships"("user_id", "tenant_id");

-- CreateIndex
CREATE INDEX "equipments_tenant_id_idx" ON "equipments"("tenant_id");

-- CreateIndex
CREATE INDEX "equipments_tenant_id_status_idx" ON "equipments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_tenant_id_patrimony_key" ON "equipments"("tenant_id", "patrimony");

-- CreateIndex
CREATE INDEX "loans_tenant_id_idx" ON "loans"("tenant_id");

-- CreateIndex
CREATE INDEX "loans_tenant_id_user_id_idx" ON "loans"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "loans_equipment_id_idx" ON "loans"("equipment_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- Partial index: 1 empréstimo ATIVO por equipamento.
-- O Prisma não modela index filtrado; entra como SQL bruto nesta migration
-- (AGENTS_DB.md: objetos que o Prisma não modela vão em SQL bruto).
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX "loans_equipment_active_key"
  ON "loans"("equipment_id")
  WHERE "returned_at" IS NULL;

-- ----------------------------------------------------------------------------
-- RLS (defesa em profundidade) — AGENTS_DB.md: toda tabela de domínio nasce
-- com Row Level Security habilitado e policy explícita na MESMA migration.
-- A autorização primária é guard + CASL (ADR-001 §7); RLS é a última barreira.
-- ----------------------------------------------------------------------------
ALTER TABLE "tenants"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipments"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loans"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;

-- tenants: usuário autenticado vê o tenant do request atual.
DROP POLICY IF EXISTS "tenants_select" ON "tenants";
CREATE POLICY "tenants_select" ON "tenants"
  FOR SELECT TO authenticated
  USING ("id"::text = current_setting('app.current_tenant', true));

-- memberships: isolamento por tenant. O escopo por usuário (cada um vê os
-- próprios vínculos) é garantido pela app (guard + CASL); aqui o RLS é
-- defesa em profundidade por tenant. (Sem auth.uid(): schema auth pode não
-- estar acessível na search_path do migration/shadow.)
DROP POLICY IF EXISTS "memberships_select" ON "memberships";
CREATE POLICY "memberships_select" ON "memberships"
  FOR SELECT TO authenticated
  USING ("tenant_id"::text = current_setting('app.current_tenant', true));

-- equipments: isolamento por tenant (tenant A não vê dado de tenant B).
DROP POLICY IF EXISTS "equipments_select" ON "equipments";
CREATE POLICY "equipments_select" ON "equipments"
  FOR SELECT TO authenticated
  USING ("tenant_id"::text = current_setting('app.current_tenant', true));

-- loans: isolamento por tenant.
DROP POLICY IF EXISTS "loans_select" ON "loans";
CREATE POLICY "loans_select" ON "loans"
  FOR SELECT TO authenticated
  USING ("tenant_id"::text = current_setting('app.current_tenant', true));

-- audit_logs: isolamento por tenant; append-only (sem policy de UPDATE/DELETE).
DROP POLICY IF EXISTS "audit_logs_select" ON "audit_logs";
CREATE POLICY "audit_logs_select" ON "audit_logs"
  FOR SELECT TO authenticated
  USING ("tenant_id"::text = current_setting('app.current_tenant', true));

-- rate_limits: SEM policy = deny by default. Só a API (role própria) escreve.
