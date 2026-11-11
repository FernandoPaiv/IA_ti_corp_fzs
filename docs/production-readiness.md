# Preparação dos repositórios para produção

## Variáveis e credenciais

O backend valida `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e
`FRONTEND_ORIGIN` antes de abrir a API. Valores ausentes ou inválidos fazem a
inicialização falhar com a lista dos problemas. `DIRECT_URL` é obrigatório para
Prisma Migrate; `PORT` tem padrão local/da plataforma. A busca de imagens é
opcional e retorna lista vazia, com aviso no log, se faltar `PIXABAY_API_KEY`
ou se o provedor falhar.

Obtenha os valores somente no projeto correto:

| Variável | Origem e uso |
| --- | --- |
| `DATABASE_URL` | Supabase **Connect** → Transaction pooler (Supavisor), porta `6543`; runtime Prisma. Acrescente `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL` | Supabase **Connect** → conexão direta, porta `5432`; somente migrations. |
| `SUPABASE_URL` | Supabase **Project Settings → API → Project URL**. |
| `SUPABASE_ANON_KEY` | Supabase **Project Settings → API → anon/public key**; API Auth do backend. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **Project Settings → API → service_role/secret key**; somente scripts de criação de usuário, nunca na API pública nem no frontend. |
| `JWKS_URI` | Opcional. Por padrão deriva de `SUPABASE_URL` como `/auth/v1/.well-known/jwks.json`; se definida, deve ser esse endpoint no mesmo host. |
| `JWT_SECRET` | Não configurar. A API não valida tokens HS256/segredo compartilhado: verifica assinatura assimétrica `ES256`/`RS256` usando JWKS. |
| `PIXABAY_API_KEY` | Criar/consultar chave em <https://pixabay.com/api/docs/>. Opcional; sua ausência não interrompe catálogo ou empréstimos. |
| `FRONTEND_ORIGIN` | URL(s) exata(s) do frontend, separadas por vírgula; definir no ambiente da API/Vercel. |

O `.env.example` do backend contém apenas modelos sem credenciais. O frontend
atual é um site estático que não carrega `.env` e não precisa de chaves
Supabase; veja `frontend-repo/.env.example`. Nunca copie `service_role`,
senhas ou connection strings para arquivos versionados, HTML ou JavaScript.

## Migrations Prisma

As migrations estão em ordem cronológica e não removem tabelas ou dados:

1. `20261001122435_init_multi_tenant`: cria o schema inicial, índices, chaves,
   políticas RLS e o índice único parcial de empréstimo ativo.
2. `20261110183000_equipment_image_metadata`: adiciona somente colunas de
   metadados opcionais de imagem em `equipments`.

O primeiro arquivo contém `DROP POLICY IF EXISTS` apenas para recriar as
políticas identificadas; não apaga tabelas ou registros. Nenhuma migration foi
aplicada ao Supabase durante esta preparação.

Procedimento após confirmar manualmente o projeto e configurar `DIRECT_URL`
para a conexão direta desse projeto:

```powershell
npm ci
npx prisma generate
npx prisma migrate status
npm run db:migrate:deploy
```

`migrate status` deve ser revisado antes do deploy. Se o schema de produção já
existir sem o histórico correspondente em `_prisma_migrations`, pare: não
execute o baseline às cegas nem use `prisma db push`; faça o baseline/stamping
de forma controlada após comparar schema e histórico. O deploy executa apenas
migrations pendentes. Não rode migrations ou seeds a partir de uma sessão com
destino não confirmado.

## Seed de usuário inicial e seed de QA

`npx prisma db seed` agora cria/garante somente o tenant `suporte_ti`. Não cria
equipamentos, empréstimos, histórico ou dados operacionais. Para executá-lo
deliberadamente, exige `TENANT_SEED_CONFIRMATION=ENSURE_INITIAL_TENANT` e
`SEED_EXPECTED_DATABASE_HOST` igual ao host conferido no `DATABASE_URL`.

Os scripts separados `npm run seed:professor` e `npm run seed:qa-user` criam ou
reutilizam a conta Supabase e garantem somente a membership no tenant
`suporte_ti` (`admin` para Marcelo; `colaborador` para QA). Não atualizam
senhas/roles de contas existentes nem escrevem loans, audit logs ou
equipamentos. A conta de QA rejeita o e-mail do professor. Para criar uma nova
conta, os scripts exigem senha com pelo menos 12 caracteres, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, o URL Supabase e host do banco
repetidos em `SEED_EXPECTED_SUPABASE_URL` e `SEED_EXPECTED_DATABASE_HOST`, e a
confirmação deliberada:

```powershell
$env:SEED_CONFIRMATION = "CREATE_AUTH_USER_AND_MEMBERSHIP"
# Preencha estes dois valores apos comparar com o painel do projeto correto.
$env:SEED_EXPECTED_SUPABASE_URL = "<URL Supabase confirmada>"
$env:SEED_EXPECTED_DATABASE_HOST = "<host do DATABASE_URL confirmado>"
npm run seed:professor
```

Para QA, defina `QA_USER_EMAIL` e `QA_USER_PASSWORD` como credenciais separadas
antes de executar:

```powershell
$env:SEED_CONFIRMATION = "CREATE_AUTH_USER_AND_MEMBERSHIP"
$env:SEED_EXPECTED_SUPABASE_URL = "<URL Supabase confirmada>"
$env:SEED_EXPECTED_DATABASE_HOST = "<host do DATABASE_URL confirmado>"
npm run seed:qa-user
```

As senhas devem ser obtidas por canal seguro, nunca gravadas no `.env.example`
ou em Git. Estes comandos estão documentados para uso deliberado após revisão;
nenhum seed foi executado nesta preparação.

## JWT e isolamento por tenant

O backend aceita somente JWT Supabase com issuer do projeto, audience
`authenticated`, assinatura `ES256`/`RS256` verificada via JWKS e claim
`tenant_id` UUID obrigatório. O tenant é sempre conferido contra
`memberships(user_id, tenant_id)`; o corpo e a query não escolhem tenant.
Tokens sem claim, com claim malformado ou sem membership correspondente são
rejeitados.

1. Revise e execute `supabase/access-token-hook.sql` no **SQL Editor** do
   projeto Supabase correto, somente após verificar o project ref. O SQL cria
   a função de hook e concede execução apenas a `supabase_auth_admin`.
2. No Dashboard, abra **Authentication → Hooks**, adicione o hook **Custom
   Access Token**, e selecione `public.custom_access_token_hook`.
3. Faça login de usuários existentes novamente para receber tokens com o claim.
   Usuário com um único membership recebe esse tenant automaticamente. Para
   usuários com múltiplos memberships, defina `app_metadata.tenant_id` por uma
   operação administrativa confiável; o hook confere esse valor contra a
   membership antes de emitir o token. Não use `user_metadata` nem valor vindo
   do navegador para escolher tenant.
4. Verifique o token emitido em ambiente de QA: deve conter `tenant_id` UUID e
   corresponder a uma linha de membership antes de validar rotas protegidas.

O hook não foi configurado nem executado nesta preparação.

## Imagens e empréstimos

A busca Pixabay tem timeout de oito segundos e devolve `[]` com aviso no log em
caso de chave ausente, timeout, falha HTTP ou resposta inválida. A validação
dos dados de imagem e do tenant ao associar imagem permanece ativa.

Os empréstimos mantêm limite de três em aberto por usuário/tenant, bloqueio por
atraso e status indisponível, tenant derivado do JWT, transação com advisory
lock por usuário e atualização condicional de disponibilidade; o índice único
parcial do banco impede dois empréstimos ativos para o mesmo equipamento.
Devolução e auditoria permanecem na mesma transação. As migrations e seeds não
foram aplicadas a banco de produção.
