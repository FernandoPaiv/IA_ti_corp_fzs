# Handoff

> Regra de origem: [`rules/handoff.md`](rules/handoff.md). No máximo 25 linhas.
> Sobrescreva este arquivo ao fechar uma tarefa do plano.

1. **Onde parei** — Tarefa: schema de dados multi-tenant inicial concluído.
   Critério: migration `20261001122435_init_multi_tenant` aplicada + reset OK +
   seed `suporte_ti` criado. API `/v1/health` e `/v1/health/db` no ar.
2. **Commitado / branch** — branch `main`. Último: `105acc6` *feat(db): schema
   multi-tenant inicial (Prisma) + RLS + seed*. Antes: `39528b2` (entrypoint
   `src/main.ts` + `@nestjs/cli`). Front: `53947a6` *fix(api): usar URL do back*.
3. **No banco local, não commitado** — Nada. `.env` corrigido (DATABASE_URL 6543
   pooler + DIRECT_URL 5432) e gitignored. Nenhuma alteração pendente no banco.
4. **Já publicado** — Back: `https://ia-ti-corp-fzsbackend.vercel.app` (deploy
   zero-config, `/v1/health/db`). Front: `https://ia-ti-corp-fzs-front-git-main-fezes-team.vercel.app`.
   PENDENTE: `DATABASE_URL` + `DIRECT_URL` como env vars do back na Vercel.
5. **Não fazer na próxima sessão** — Não criar `chamados` (fora desta migration);
   não usar `auth.uid()` nas policies (schema auth não acessível); não tocar no
   Supabase remoto; não commitar `frontend-repo/` no repo do backend.
6. **Próximo passo** — Implementar o módulo de equipamentos
   (`src/modules/equipments/`) com guard + CASL e o teste de isolamento por
   tenant, seguindo `docs/adr/001-stack.md` §6-§7.
