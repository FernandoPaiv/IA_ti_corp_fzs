# Handoff

> Regra de origem: [`rules/handoff.md`](rules/handoff.md). No máximo 25 linhas.
> Sobrescreva este arquivo ao fechar uma tarefa do plano.

1. **Onde parei** — Tarefa: conclusão do scaffold do backend NestJS. Critério em
   andamento: PREENCHER (CA-xx de `docs/specs/`) — saúde da API/DB já em `main`,
   `/v1` e `/v1/health/db` respondendo; persistence (Prisma) ainda ausente.
2. **Commitado / branch** — branch `main`. Último: `f1cc343` *feat(cors): aceitar
   allowlist de origens do front via FRONTEND_ORIGIN*. Antes: `b34fb01` (docs),
   `9e35c56` (deploy zero-config Vercel, removeu `vercel.json`). Front:
   `53947a6` *fix(api): usar URL do back da Vercel em producao*.
3. **No banco local, não commitado** — Nada. Ainda não existe `prisma/` no repo
   (sem schema, sem migrations, sem seed `suporte_ti`). PREENCHER se houver
   alteração aplicada localmente.
4. **Já publicado** — Back: `https://ia-ti-corp-fzsbackend.vercel.app` (deploy
   zero-config, `/v1/health/db`). Front: `https://ia-ti-corp-fzs-front-git-main-fezes-team.vercel.app`.
   PENDENTE no painel: setar `FRONTEND_ORIGIN` do back para a URL do front.
5. **Não fazer na próxima sessão** — Não escrever Prisma/Auth/CASL sem a spec de
   `docs/specs/` e sem plano aprovado; não tocar no Supabase remoto; não commitar
   `frontend-repo/` no repo do backend.
6. **Próximo passo** — PREENCHER: crie `prisma/schema.prisma` com a primeira
   entidade de domínio (com `tenant_id`), gere a migration e ative RLS + policy
   na mesma migration, seguindo `docs/adr/001-stack.md`.
