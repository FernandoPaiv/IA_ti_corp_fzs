# Handoff

> Regra de origem: [`rules/handoff.md`](rules/handoff.md). No máximo 25 linhas.
> Sobrescreva este arquivo ao fechar uma tarefa do plano.

1. **Onde parei** — Tarefa: conclusão do scaffold do backend NestJS. Critério em
   andamento: PREENCHER (CA-xx de `docs/specs/`) — saúde da API/DB já em `main`,
   `/v1` e `/v1/health/db` respondendo; persistence (Prisma) ainda ausente.
2. **Commitado / branch** — branch `main`. Último: `4894899` *Fix Vercel build:
   drop framework null forcing static output directory*. Antes: `6816a17`,
   `092ef77`, `b6a6fd8` (entrypoint serverless + health). Front:
   `194190e` *Add live API/DB status indicator on home page*.
3. **No banco local, não commitado** — Nada. Ainda não existe `prisma/` no repo
   (sem schema, sem migrations, sem seed `suporte_ti`). PREENCHER se houver
   alteração aplicada localmente.
4. **Já publicado** — PREENCHER: URL da API na Vercel. Front publicado com a
   home Nocturne consumindo `/v1/health/db`.
5. **Não fazer na próxima sessão** — Não escrever Prisma/Auth/CASL sem a spec de
   `docs/specs/` e sem plano aprovado; não tocar no Supabase remoto; não commitar
   `frontend-repo/` no repo do backend.
6. **Próximo passo** — PREENCHER: crie `prisma/schema.prisma` com a primeira
   entidade de domínio (com `tenant_id`), gere a migration e ative RLS + policy
   na mesma migration, seguindo `docs/adr/001-stack.md`.
