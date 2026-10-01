# Revisão de specs e regras — contradições e repetições

Data: 01/10/2026. Escopo: todos os `.md` do repositório backend (fora de
`node_modules/`). Objetivo: apontar onde duas fontes divergem (contradição) ou
onde o mesmo conteúdo está escrito em vários lugares (repetição).

Método: leitura cruzada de `AGENTS.md`, `AGENTS_DB.md`, `docs/adr/*`,
`rules/*`, `rules_example/*`, `tests.md`, `handoff.md`, `docs/docs.md`,
`layout.md`, `stacksI.md`, `.env.example`.

## A. Contradições

### A1. Quem é o dono do schema e qual CLI gera migration (contradição alta)

- **Fonte A (Prisma):** `AGENTS.md:42`, `AGENTS_DB.md:18,61`, `rules/migration.md:17`,
  `docs/adr/001-stack.md:95,232` — "Prisma Migrate é o dono único; Supabase CLI
  **não** é segundo dono"; migration via `npx prisma migrate dev`.
- **Fonte B (Supabase CLI):** `rules_example/migration_example.md:18,26,29` e
  `rules_example/checks.example.md:15` — "Gere a migration pela CLI:
  `supabase migration new <nome>`" e "`supabase db reset`".

As duas não podem valer. A pasta `rules_example/` ainda usa o modelo antigo
(Supabase CLI como dono) que o ADR-001 §5 rejeitou explicitamente.

**Recomendação:** marcar `rules_example/` como histórico/não-vinculante (ou
apagar), e garantir que nenhum arquivo em `rules/` cite Supabase CLI.

### A2. Comando de reset do banco (mesma raiz de A1)

- `rules/checks.md:18`, `rules/migration.md:38,43`, `AGENTS_DB.md:44,50` →
  `npx prisma migrate reset`.
- `rules_example/checks.example.md:15`, `rules_example/migration_example.md:26,29`
  → `supabase db reset`.

**Recomendação:** padronizar em `npx prisma migrate reset` (já é o que
`tests.md` e `docs/docs.md` usam).

### A3. Push na branch de produção: proibido vs. permitido (contradição alta)

- **Fonte A (proíbe):** `rules_example/restricion_example.md:37` — "Não faça
  push na branch de produção. Trabalhe em branch e abra PR."
- **Fonte B (permite):** `rules/restricion.md:37-39` — "Posso executar comandos
  git (add, commit, push) ... incluída a branch `main`, quando o dono o pedir".

Aqui `rules/` e `rules_example/` divergem frontalmente. Além disso, o próprio
repositório trabalha direto na `main` (histórico de commits), o que confirma que
o modelo "branch + PR" do exemplo não é o que está em uso.

**Recomendação:** manter a versão de `rules/restricion.md` (permitido a pedido) e
anotar que `restricion_example.md` está obsoleto.

### A4. `DATABASE_URL` com porta de migration, sem `DIRECT_URL` (inconsistência)

- Todos os docs (`AGENTS.md:45-46`, `AGENTS_DB.md:25-26`, `docs/adr/001-stack.md`
  §5) dizem: runtime = **6543**; migration = `directUrl` = **5432**.
- `.env.example:7` define uma única `DATABASE_URL` já com **5432** e não define
  `DIRECT_URL`. O comentário (`.env.example:4`) até lista as duas portas.

Na prática o runtime estaria usando a porta de migration e não existe a variável
`directUrl` que o schema/Prisma espera.

**Recomendação:** `DATABASE_URL` na 6543 (com `?pgbouncer=true&connection_limit=1`)
e adicionar `DIRECT_URL` na 5432.

### A5. "Não escreva ADR" vs. ADRs existentes (contradição de regra)

- `rules/restricion.md:12` e `rules_example/restricion_example.md:12` — "Não
  escreva ADR ... Quem decide é o time."
- O repositório tem `docs/adr/001-stack.md` e agora `docs/adr/002-design-system.md`
  (criado a pedido do dono).

A regra mira o agente *inventar* decisão; o `002` formaliza decisão já tomada
pelo time (o `layout.md`). Ainda assim, a redação atual parece proibir todo ADR.

**Recomendação:** ajustar a regra para "não decida arquitetura por conta própria;
o ADR é escrito pelo time ou a pedido explícito do dono".

### A6. `main.ts` citado no código, mas `server.ts` é o entrypoint

- `src/modules/health/health.controller.ts:6` — comentário "Prefixo global `/v1`
  definido em main.ts".
- `src/server.ts:36` — quem faz `app.setGlobalPrefix('v1')` é o `server.ts`;
  **não existe `src/main.ts`** (`docs/docs.md:61` confirma a ausência).

Não é uma regra, mas é um contrato/documentação que contradiz o código.

## B. Repetições

### B1. `AGENTS_DB.md` ≈ `rules/migration.md`

Os dois arquivos têm o **mesmo conteúdo** (stack de dados, dois endpoints,
procedimento de migration, verificação, "não faça"). `AGENTS_DB.md` está em
espanhol e `rules/migration.md` em espanhol/português. `docs/docs.md:14` aponta
`rules/migration.md` → `AGENTS_DB.md`, assumindo que são a mesma regra.

**Recomendação:** manter um só (sugestão: `rules/migration.md`) e transformar o
outro em link/remover.

### B2. `rules/` vs. `rules_example/`

`restricion_example.md` ≈ `rules/restricion.md` (mesmo documento, versões
diferentes) e `checks.example.md` ≈ `rules/checks.md`. `migration_example.md` ≈
`rules/migration.md` (com Supabase CLI no lugar de Prisma).

**Recomendação:** `rules_example/` é o "antes"; arquivar em um subdiretório
(ex.: `rules/_arquivo/`) ou remover, para não competir com `rules/`.

### B3. `stacksI.md` ≈ `docs/adr/001-stack.md`

`stacksI.md` (24 KB) é o rascunho bruto de onde o `001-stack.md` (20 KB) foi
gerado; as seções, tabelas e "alternativas descartadas" são quase idênticas.

**Recomendação:** manter o ADR como fonte e marcar `stacksI.md` como
"insumo/rascunho" no topo (já diz isso na linha 3) ou removê-lo do repo.

### B4. `layout.md` vs. `docs/adr/002-design-system.md`

Depois de criar o ADR-002, os dois cobrem cores, tipografia, componentes,
páginas, animações e dados de exemplo. O ADR já referencia o `layout.md` como
detalhe, mas há sobreposição grande.

**Recomendação:** decidir a divisão: ADR = decisão + tokens; `layout.md` =
especificação de reprodução. Remover do `layout.md` o que virou decisão, ou
rotulá-lo como "referência de tela".

### B5. Regra "não tocar no Supabase remoto"

Repetida em: `AGENTS.md`, `AGENTS_DB.md:59`, `rules/migration.md:51`,
`rules/restricion.md:41`, `rules/secrets.md` (implícito), `docs/docs.md:66`.
São 5+ cópias — cada uma pode divergir no futuro.

**Recomendação:** ser a regra em um lugar e referenciar nos outros.

### B6. Regra de isolamento por tenant

Repetida em: `AGENTS.md:76`, `rules/checks.md:23-25`, `tests.md:34-38`,
`AGENTS_DB.md:62`. O texto é coerente, mas está em 4 lugares.

**Recomendação:** consolidar em `tests.md` (versão concreta) e citar dele.

### B7. Regras "não relate sucesso parcial" / "git status --short"

`rules/checks.md:26,34` ≈ `rules_example/checks.example.md:19,28` ≈
`docs/docs.md:39` (git status) — repetição entre template e versão concreta.

## C. Pontos menores

- `rules/checks.md:4` e `stacksI.md` usam `> lector: agente` (espanhol/misto);
  `rules/secrets.md:8` usa `> leitor: agente`. Inconsistência de idioma nos
  cabeçalhos (o projeto é pt-BR).
- `docs/docs.md:52` diz "Fonte das decisões: `docs/adr/001-stack.md`" — desatualizado
  após existir o ADR-002.
- Não existe `docs/specs/` (pasta exigida por `rules/restricion.md:25` e citada em
  `tests.md:29`), então "CA-xx" e `test_ca_03_...` não têm fonte ainda.

## D. Matriz-resumo

| # | Tipo | Onde | Ação sugerida |
|---|---|---|---|
| A1 | Contradição | `rules_example/*` vs `rules/migration.md`+ADR | Desvincular Supabase CLI |
| A2 | Contradição | reset: `supabase db reset` vs `prisma migrate reset` | Padronizar Prisma |
| A3 | Contradição | push: `restricion_example` vs `rules/restricion` | Manter `rules/`, arquivar exemplo |
| A4 | Inconsistência | `.env.example` porta 5432 / sem `DIRECT_URL` | 6543 + `DIRECT_URL` 5432 |
| A5 | Contradição | "não escreva ADR" vs ADR-001/002 | Reescrever a regra |
| A6 | Doc vs código | comentário "main.ts" em `health.controller.ts` | Corrigir para `server.ts` |
| B1 | Repetição | `AGENTS_DB.md` = `rules/migration.md` | Manter 1 |
| B2 | Repetição | `rules_example/` = `rules/` | Arquivar exemplo |
| B3 | Repetição | `stacksI.md` = `001-stack.md` | Manter ADR |
| B4 | Repetição | `layout.md` = `002-design-system.md` | Dividir papel de cada um |
| B5 | Repetição | "não tocar Supabase remoto" (6x) | Fonte única |
| B6 | Repetição | isolamento tenant (4x) | Consolidar em `tests.md` |
| B7 | Repetição | "sucesso parcial"/"git status" (3x) | Consolidar em `tests.md`/checks |

**Recomendação:** corrigir o comentário para `server.ts`.
