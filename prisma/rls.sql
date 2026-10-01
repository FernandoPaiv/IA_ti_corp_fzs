-- ============================================================================
-- RLS (defesa em profundidade) — AGENTS_DB.md: toda tabela de domínio nasce com
-- Row Level Security habilitado e pelo menos uma policy explícita, na MESMA
-- migration do Prisma (SQL bruto, versionado).
--
-- A autorização PRIMÁRIA é guard + CASL na app (ADR-001 §7). O RLS é a última
-- barreira: se uma credencial vazar ou um endpoint esquecer o guard, a policy
-- impede o vazamento entre tenants.
--
-- O Prisma conecta com role dono das tabelas (bypassa RLS por padrão); as
-- policies valem para qualquer outra credencial. O tenant corrente vem de
-- `current_setting('app.current_tenant', true)` (setado por request no guard).
-- ============================================================================

-- Habilita RLS (deny by default) em todas as tabelas criadas.
ALTER TABLE tenants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits   ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- tenants: usuários autenticados podem VER o tenant do request atual.
-- O claim `auth.uid()` evita depender do role (o Prisma bypassa RLS; isso
-- protege credenciais não-dono).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS tenants_select ON tenants;
CREATE POLICY tenants_select ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id::text = current_setting('app.current_tenant', true)
    OR (auth.uid() IS NOT NULL AND id::text = current_setting('app.current_tenant', true))
  );

-- ----------------------------------------------------------------------------
-- memberships: isolamento por tenant. O escopo por usuário (cada um vê os
-- próprios vínculos) é garantido pela app (guard + CASL); aqui o RLS é
-- defesa em profundidade por tenant.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS memberships_select ON memberships;
CREATE POLICY memberships_select ON memberships
  FOR SELECT
  TO authenticated
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- ----------------------------------------------------------------------------
-- equipments: isolamento por tenant (tenant A não vê dado de tenant B).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS equipments_select ON equipments;
CREATE POLICY equipments_select ON equipments
  FOR SELECT
  TO authenticated
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- ----------------------------------------------------------------------------
-- loans: isolamento por tenant.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS loans_select ON loans;
CREATE POLICY loans_select ON loans
  FOR SELECT
  TO authenticated
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- ----------------------------------------------------------------------------
-- audit_logs: isolamento por tenant (leitura) + append-only (escrita pelo app).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- Append-only: nenhuma política de UPDATE/DELETE (negar por ausência).
-- INSERT acontece pelo app com role próprio (bypassa RLS).

-- ----------------------------------------------------------------------------
-- rate_limits: negado por padrão. Nenhuma policy = deny by default.
-- A API escreve com role própria (bypassa RLS). NÃO criar policy aqui.
-- ----------------------------------------------------------------------------
