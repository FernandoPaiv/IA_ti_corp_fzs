# Pontos de partida — fzs do grilo (backend `IA_ti_corp_tb`)

Documento de entrada para uma sessão nova. Reúne os "pontos de partida" que
estavam nos arquivos de `rules/` (escritos em forma de template) e os traduz
para os valores concretos deste projeto.

## 1. Arquivos de regra (templates) e sua versão concreta

| Regra (template)             | Versão concreta neste repo                     |
| ---------------------------- | ---------------------------------------------- |
| `rules/tests.md`             | [`tests.md`](../tests.md) (raiz)                |
| `rules/handoff.md`           | [`handoff.md`](../handoff.md) (raiz)            |
| `rules/checks.md`            | abaixo, seção 3                                 |
| `rules/migration.md`         | `AGENTS_DB.md` (Prisma Migrate + Supabase)      |
| `rules/restricion.md`        | inalterada                                       |
| `rules/secrets.md`           | inalterada                                       |
| `rules_example/*`            | exemplo anterior (placeholder `<CAMINHO-...>`)  |

> Os arquivos em `rules/` usam placeholders como `<COMANDO-TESTES>`,
> `<COMANDO-BUILD>` e `<CAMINHO-DO-ACESSO-A-DADOS>`. Abaixo estão os valores.

## 2. Comandos reais (placeholders resolvidos)

| Placeholder              | Comando / valor                             |
| ------------------------ | ------------------------------------------- |
| `<COMANDO-TESTES>`       | `npm test` → `jest --runInBand`             |
| `<COMANDO-BUILD>`        | `npm run build` → `tsc -p tsconfig.json`    |
| Reset do banco local     | `npx prisma migrate reset --force`          |
| Apply em CI              | `npx prisma migrate deploy`                 |
| Dev / Start              | `npm run dev` / `npm start`                 |
| Path do acesso a dados   | `prisma/schema.prisma`, `prisma/migrations/`|

## 3. Verificação de fim de tarefa (`rules/checks.md`)

Pronto = as duas coisas, não uma:

```bash
npm test && npm run build          # sem falha
git status --short                 # só arquivos do escopo da tarefa
```

- Se a tarefa tocou em migration: `npx prisma migrate reset` local e confirmar
  que o banco sobe do zero; o seed idempotente cria o tenant `suporte_ti`.
- Todo endpoint tocado por tenant exige teste de isolamento (A não vê B).

## 4. Constantes do projeto

- Repo backend: `IA_ti_corp_fzs` (este) · front: `frontend-repo/` (repo próprio).
- Branch de trabalho: `main`. Prefixo de rota da API: `/v1`.
- Banco: Postgres no Supabase · runtime Supavisor porta **6543**
  (`?pgbouncer=true&connection_limit=1`) · migration `directUrl` porta **5432**.
- Tenant inicial: `suporte_ti` (seed). Erros na API: RFC 9457.
- Fonte das decisões: `docs/adr/001-stack.md`.

## 5. Estado atual do scaffold (o que já existe)

- `src/server.ts` — entrypoint serverless da Vercel com instância Nest cacheada.
- `src/app.module.ts` + `src/modules/health/*` — `GET /v1/health` e
  `GET /v1/health/db` (ping `SELECT NOW()`).
- `vercel.json`, `package.json` (NestJS 10, Express, `pg`).
- **Ainda não existe:** `prisma/` (schema/migrations/seed), `src/main.ts`,
  Jest config e pasta de testes, Auth/CASL, helmet/pino/Sentry, CI.

## 6. O que NÃO fazer

- Não tocar no projeto Supabase remoto — tudo no banco local, via Prisma Migrate.
- Não alterar o schema fora de uma migration; Prisma Migrate é o dono único.
- Não escrever feature sem spec em `docs/specs/` e plano aprovado.
- Não commitar `frontend-repo/` no repositório do backend.
- Não escrever ADR nem escolher biblioteca fora do ADR-001 — pare e proponha.
