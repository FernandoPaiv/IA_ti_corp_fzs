# Stack â€” base para o ADR-001

Serve de insumo para `docs/adr/001-stack.md`.
Cada item tem escolha e uma linha de justificativa, no formato que o ADR espera.

---

## 1. RepositÃ³rios

| Item | Escolha |
|---|---|
| Estrutura | Dois repositÃ³rios: um para o front, um para a API |
| Projetos na Vercel | Dois, um por repositÃ³rio |
| Compartilhamento de tipos | Nenhum pacote compartilhado; via OpenAPI gerado |

- **Dois repositÃ³rios** â€” front e API tÃªm ciclo de release e responsÃ¡veis diferentes; repositÃ³rio separado deixa o histÃ³rico e as permissÃµes separados tambÃ©m.
- **Sem pacote compartilhado** â€” publicar pacote npm privado e bumpar versÃ£o a cada campo alterado Ã© atrito maior do que o ganho; o contrato atravessa via arquivo gerado.

---

## 2. Frontend

| Item | Escolha |
|---|---|
| Linguagem | TypeScript em modo `strict` |
| Biblioteca de UI | React |
| Build e dev server | Vite |
| Roteamento | React Router (data APIs) |
| Estado de servidor | TanStack Query |
| Estado de cliente | Zustand |
| FormulÃ¡rios | React Hook Form + `zodResolver` |
| EstilizaÃ§Ã£o | Tailwind CSS |
| Componentes | shadcn/ui |
| Cliente da API | Gerado a partir do `openapi.json` com orval |

- **TypeScript `strict`** â€” sem `strict` o tipo gerado da API nÃ£o pega os casos de nulo, que sÃ£o exatamente os que quebram em produÃ§Ã£o.
- **React** â€” jÃ¡ era a decisÃ£o; mantida.
- **Vite** â€” o app Ã© uma SPA sem necessidade de renderizaÃ§Ã£o no servidor, entÃ£o nÃ£o preciso do peso de um framework full-stack.
- **React Router** â€” preciso de rotas aninhadas e proteÃ§Ã£o de rota por sessÃ£o; escrever isso na mÃ£o custa mais do que a curva da biblioteca.
- **TanStack Query** â€” com REST puro eu teria que reimplementar cache, revalidaÃ§Ã£o, retry e estado de loading em cada tela; isso Ã© a maior fonte de bug repetido em SPA.
- **Zustand** â€” o estado que sobra depois do TanStack Query Ã© pouco (UI, filtros, wizard), e nÃ£o justifica uma store grande.
- **React Hook Form + zodResolver** â€” o schema Zod do formulÃ¡rio sai do mesmo OpenAPI, entÃ£o a regra de validaÃ§Ã£o de formato nÃ£o Ã© reescrita.
- **Tailwind** â€” o design vem do Figma e precisa ser reproduzido de perto; biblioteca com visual prÃ³prio brigaria com isso.
- **shadcn/ui** â€” copia o componente para dentro do repositÃ³rio em vez de esconder atrÃ¡s de API de biblioteca, entÃ£o customizar nÃ£o vira luta contra a dependÃªncia.
- **Cliente gerado, nÃ£o escrito** â€” cliente HTTP escrito Ã  mÃ£o Ã© onde o tipo da resposta Ã© reescrito errado e ninguÃ©m percebe atÃ© a tela quebrar.

---

## 3. Backend

| Item | Escolha |
|---|---|
| Runtime | Node.js LTS |
| Framework | NestJS |
| Adapter HTTP | Express via `@vendia/serverless-express`, com instÃ¢ncia cacheada |
| OrganizaÃ§Ã£o de pastas | Por domÃ­nio (`src/modules/<dominio>/`) |
| Camadas | Controller â†’ Service â†’ Repository |
| ValidaÃ§Ã£o de entrada | Zod via `nestjs-zod` |
| Contexto de request | `AsyncLocalStorage` com `tenant_id` e `user_id` |

- **Node LTS** â€” o mesmo TypeScript roda nos dois lados e a versÃ£o LTS me dÃ¡ janela de suporte previsÃ­vel.
- **NestJS** â€” jÃ¡ era a decisÃ£o; mantida. InjeÃ§Ã£o de dependÃªncia Ã© o que torna o service testÃ¡vel sem subir a aplicaÃ§Ã£o inteira.
- **Adapter serverless com instÃ¢ncia cacheada** â€” na Vercel o Nest nÃ£o roda como processo; sem guardar a aplicaÃ§Ã£o criada fora do handler, cada request paga o bootstrap do container de DI.
- **Pastas por domÃ­nio** â€” organizar por camada tÃ©cnica (`controllers/`, `services/`) faz cada feature nova espalhar arquivos em quatro pastas distantes.
- **Controller â†’ Service â†’ Repository** â€” substitui "MVC" da lista original: nÃ£o existe View no servidor, o front Ã© uma SPA separada. O Repository isola o Prisma para o service nÃ£o depender de ORM.
- **Zod via `nestjs-zod`, sem `class-validator`** â€” Ã© o que gera o OpenAPI a partir do mesmo schema que valida a entrada; com dois validadores, o documento gerado e a validaÃ§Ã£o real divergem.
- **`AsyncLocalStorage` com o tenant** â€” passar `tenant_id` como parÃ¢metro em toda assinatura de mÃ©todo Ã© o tipo de coisa que alguÃ©m esquece uma vez e vira vazamento entre tenants.

---

## 4. Contrato de API

| Item | Escolha |
|---|---|
| Estilo | REST |
| Fonte do contrato | OpenAPI gerado dos schemas Zod do Nest |
| DistribuiÃ§Ã£o | `openapi.json` publicado como artefato do CI da API |
| Consumo | Front regenera o cliente por script, versionado no repositÃ³rio |
| Versionamento | Prefixo de rota `/v1` |
| Formato de erro | RFC 9457 (Problem Details) |
| PaginaÃ§Ã£o de listas | Cursor |
| Tempo real | Fora de escopo â€” Vercel nÃ£o suporta WebSocket |

- **REST** â€” jÃ¡ era a decisÃ£o; mantida. O modelo de recurso casa com o CRUD que domina o app.
- **OpenAPI no lugar de ts-rest** â€” ts-rest exige que os dois lados importem o mesmo pacote, o que nÃ£o existe com repositÃ³rios separados. O OpenAPI atravessa a fronteira como arquivo.
- **Cliente gerado versionado no front** â€” deixa a mudanÃ§a de contrato visÃ­vel no diff do PR, que Ã© o substituto possÃ­vel para o build quebrar sozinho.
- **`/v1` desde o inÃ­cio** â€” adicionar versionamento depois que existe cliente em produÃ§Ã£o obriga a manter rota sem versÃ£o para sempre.
- **RFC 9457** â€” sem formato Ãºnico de erro, cada tela trata a falha de um jeito e o front acaba lendo string de mensagem.
- **PaginaÃ§Ã£o por cursor** â€” offset fica lento e duplica registro quando a lista recebe escrita concorrente.
- **Sem tempo real** â€” function serverless nÃ£o mantÃ©m conexÃ£o aberta; atualizaÃ§Ã£o de tela Ã© polling do TanStack Query.

---

## 5. Dados e persistÃªncia

| Item | Escolha |
|---|---|
| Banco | PostgreSQL gerenciado pelo Supabase |
| ORM | Prisma |
| Dono do schema | Prisma Migrate (Ãºnico) |
| Objetos nÃ£o cobertos pelo Prisma | SQL bruto dentro das migrations do Prisma |
| ConexÃ£o de runtime | Supavisor, porta 6543, `?pgbouncer=true&connection_limit=1` |
| ConexÃ£o de migration | `directUrl`, porta 5432 |
| Seed | `prisma/seed.ts`, idempotente, cria o tenant `suporte_ti` |

- **Postgres no Supabase** â€” jÃ¡ era a decisÃ£o; mantida. Traz Auth e Storage sem eu operar servidor de banco.
- **Prisma** â€” jÃ¡ era a decisÃ£o; mantida. Tipagem gerada a partir do schema Ã© o que evita divergÃªncia entre modelo e cÃ³digo.
- **Prisma Migrate como dono Ãºnico** â€” Prisma Migrate e Supabase CLI gerenciando o mesmo banco se sobrescrevem; ter dois donos de schema Ã© como o ambiente diverge de produÃ§Ã£o sem ninguÃ©m notar.
- **RLS, policies e triggers em SQL bruto na migration** â€” o Prisma nÃ£o modela esses objetos, entÃ£o eles precisam entrar na mesma linha do tempo versionada, nÃ£o como script solto aplicado Ã  mÃ£o.
- **`directUrl` separado** â€” o pooler em transaction mode nÃ£o suporta os comandos que a migration usa; sem os dois endpoints configurados, `prisma migrate deploy` falha em produÃ§Ã£o.
- **`connection_limit=1`** â€” obrigatÃ³rio em serverless, nÃ£o recomendaÃ§Ã£o: a Vercel escala instÃ¢ncias em paralelo e cada uma abrindo pool prÃ³prio esgota a conexÃ£o do projeto.
- **Seed idempotente** â€” seed que sÃ³ funciona em banco vazio nÃ£o serve para ambiente de teste que roda vÃ¡rias vezes.

---

## 6. Multi-tenancy

| Item | Escolha |
|---|---|
| Modelo | Tenant discriminado por coluna, banco Ãºnico |
| Coluna | `tenant_id` em toda tabela de domÃ­nio |
| VÃ­nculo usuÃ¡rioâ€“tenant | Tabela `memberships (user_id, tenant_id, role)` |
| Primeiro tenant | `suporte_ti`, criado no seed |
| Origem do tenant no request | Claim do JWT, resolvido no guard, nunca do body |

- **Coluna em banco Ãºnico** â€” schema por tenant multiplicaria cada migration pelo nÃºmero de tenants; para um sistema interno o isolamento lÃ³gico basta.
- **`tenant_id` em toda tabela** â€” tabela sem a coluna nÃ£o tem como ser protegida por policy e vira o buraco por onde o dado vaza.
- **Tabela de membership** â€” a mesma pessoa pode atuar em mais de uma Ã¡rea com papel diferente em cada; papel gravado no usuÃ¡rio nÃ£o representa isso.
- **Tenant vindo do token** â€” se o cliente manda o tenant no corpo ou na query, trocar o valor Ã© toda a exploraÃ§Ã£o necessÃ¡ria.
- **Um tenant sÃ³ no inÃ­cio** â€” a estrutura existe desde o primeiro schema mesmo com um Ãºnico tenant, porque adicionar `tenant_id` depois exige backfill e revisÃ£o de toda query que toca a tabela.

---

## 7. AutenticaÃ§Ã£o e autorizaÃ§Ã£o

| Item | Escolha |
|---|---|
| Provedor de identidade | Supabase Auth, e-mail e senha |
| Cadastro | Fechado, somente por convite de administrador |
| SessÃ£o no navegador | Token no header, gerenciado pelo `supabase-js` |
| DomÃ­nio | `*.vercel.app`, um por projeto |
| VerificaÃ§Ã£o de token na API | Nest valida o JWT via JWKS do Supabase |
| CORS | Allowlist com a origem do front, `credentials` habilitado |
| Fonte da verdade de autorizaÃ§Ã£o | Guards do Nest + CASL |
| RLS | Habilitado em todas as tabelas, deny by default |
| Papel do RLS | Defesa em profundidade, nÃ£o autorizaÃ§Ã£o primÃ¡ria |

- **Supabase Auth com e-mail e senha** â€” nÃ£o hÃ¡ domÃ­nio corporativo para federar; SSO fica fora de escopo.
- **Cadastro fechado por convite** â€” sem domÃ­nio de e-mail para filtrar, cadastro aberto deixa qualquer pessoa que descubra a URL criar conta num sistema que guarda inventÃ¡rio de infraestrutura.
- **Token no header** â€” `vercel.app` estÃ¡ na Public Suffix List, entÃ£o o navegador proÃ­be cookie no domÃ­nio pai; front e API em subdomÃ­nios diferentes teriam sessÃµes isoladas e o cookie `httpOnly` nÃ£o atravessaria. Sem domÃ­nio prÃ³prio, token no header Ã© o que resta.
- **Gerenciado pelo `supabase-js`** â€” renovaÃ§Ã£o de token e persistÃªncia de sessÃ£o jÃ¡ vÃªm resolvidas; escrever isso Ã  mÃ£o adicionaria um interceptor com fila de refresh sem ganho de seguranÃ§a, jÃ¡ que o token ficaria acessÃ­vel ao JavaScript de qualquer forma.
- **JWT validado por JWKS** â€” a API nÃ£o pode confiar em header enviado pelo cliente; validar assinatura contra a chave pÃºblica fecha isso sem consultar o Supabase a cada request.
- **AutorizaÃ§Ã£o na aplicaÃ§Ã£o como fonte da verdade** â€” o Prisma conecta com um role dono das tabelas, que **bypassa RLS por padrÃ£o**. Com um Nest no meio, as policies sÃ³ rodariam se cada request abrisse transaÃ§Ã£o com `SET LOCAL role` e `SET LOCAL request.jwt.claims`, o que custa uma transaÃ§Ã£o por request e briga com o pooler.
- **RLS ligado mesmo assim** â€” se uma credencial vazar ou um endpoint esquecer o guard, a policy Ã© a Ãºltima barreira entre tenants.
- **CASL** â€” as regras sÃ£o por papel e por tenant ao mesmo tempo; `if (user.role === 'admin')` espalhado por controller nÃ£o sobrevive Ã  terceira regra.

---

## 8. Testes

| Item | Escolha |
|---|---|
| UnitÃ¡rio no backend | Jest |
| UnitÃ¡rio no frontend | Vitest |
| IntegraÃ§Ã£o de banco | Testcontainers com Postgres real |
| Teste de API | supertest sobre a app Nest |
| E2E de interface | Playwright |
| Teste obrigatÃ³rio de isolamento | Um caso por endpoint: tenant A nÃ£o enxerga dado de tenant B |
| VerificaÃ§Ã£o de contrato | CI do front falha se o cliente gerado divergir do `openapi.json` publicado |
| Meta de cobertura | Sem percentual; caminhos crÃ­ticos obrigatÃ³rios |

- **Jest no backend** â€” jÃ¡ era a decisÃ£o; Ã© o padrÃ£o do Nest e o que os schematics geram.
- **Vitest no frontend** â€” com Vite, o Jest exige configuraÃ§Ã£o de transform paralela ao build; o Vitest usa o mesmo pipeline e a mesma config.
- **Testcontainers com Postgres real** â€” mockar o Prisma testa o mock, nÃ£o o banco. Constraint, cascade, transaÃ§Ã£o e policy de RLS sÃ³ falham contra Postgres de verdade.
- **supertest** â€” valida o contrato como o cliente vai consumir, incluindo guard, pipe de validaÃ§Ã£o e filtro de exceÃ§Ã£o.
- **Playwright** â€” os fluxos que travam a operaÃ§Ã£o (login, abertura de chamado, cadastro de ativo) precisam ser testados no navegador.
- **Teste de isolamento por endpoint** â€” vazamento entre tenants Ã© a falha mais cara desse sistema e a mais fÃ¡cil de introduzir sem perceber; precisa ser verificada por teste, nÃ£o por revisÃ£o.
- **VerificaÃ§Ã£o de contrato no CI** â€” com repositÃ³rios separados, nada quebra sozinho quando a API muda; essa checagem Ã© o substituto do build compartilhado.
- **Sem meta de percentual** â€” meta de cobertura produz teste escrito para subir nÃºmero; caminho crÃ­tico Ã© critÃ©rio verificÃ¡vel.

---

## 9. Hospedagem e operaÃ§Ã£o

| Item | Escolha |
|---|---|
| Hospedagem | Vercel (front e API, projetos separados) |
| Plano | Hobby |
| RegiÃ£o das functions | PadrÃ£o do Hobby (Estados Unidos) |
| RegiÃ£o do Supabase | `sa-east-1` (SÃ£o Paulo) |
| Limite de execuÃ§Ã£o | 60s por request (teto do Hobby) |
| Fila e trabalho assÃ­ncrono | Fora de escopo; tudo roda dentro do request |
| Agendamento | Fora de escopo; sem cron |
| ConfiguraÃ§Ã£o | VariÃ¡veis de ambiente validadas com Zod no boot |
| Log | pino em JSON, com `request_id` e `tenant_id` |
| Rastreamento de erro | Sentry (API e front) |
| CI | GitHub Actions, um workflow por repositÃ³rio |
| Migration em deploy | `prisma migrate deploy` em job do GitHub Actions, antes do deploy |

- **Vercel** â€” jÃ¡ era a decisÃ£o; mantida, e a conta jÃ¡ existe com outros projetos.
- **Plano Hobby** â€” o Hobby cobre uso pessoal nÃ£o-comercial, que Ã© o caso: projeto de disciplina, sem cobranÃ§a, sem receita e sem ninguÃ©m sendo pago para escrever o cÃ³digo. Se o sistema um dia sair do contexto acadÃªmico e for usado de fato pela empresa, o plano precisa mudar antes.
- **RegiÃ£o padrÃ£o** â€” SÃ£o Paulo Ã© oferecida apenas no Pro; no Hobby as functions rodam nos EUA e cada query paga ida e volta transatlÃ¢ntica. Em contexto de demonstraÃ§Ã£o isso Ã© aceitÃ¡vel, mas Ã© o primeiro item a mudar se o projeto for usado de verdade.
- **Supabase no plano gratuito** â€” projeto ocioso pode ser pausado pelo Supabase depois de alguns dias sem uso; em semestre com intervalo entre entregas, vale confirmar o comportamento atual antes de uma apresentaÃ§Ã£o.
- **Limite de 60s** â€” vira o teto de qualquer operaÃ§Ã£o: importaÃ§Ã£o de planilha de ativos, sincronizaÃ§Ã£o e relatÃ³rio grande precisam ser desenhados em lotes que caibam nesse tempo.
- **Sem fila e sem cron** â€” nÃ£o hÃ¡ volume assÃ­ncrono conhecido agora; adicionar infraestrutura de fila sem caso de uso Ã© custo sem retorno. A consequÃªncia Ã© que envio de e-mail e integraÃ§Ã£o externa rodam dentro do request e seguram a resposta.
- **Env validado com Zod** â€” falhar na subida Ã© melhor que `undefined` virando comportamento silencioso em produÃ§Ã£o.
- **pino com `tenant_id`** â€” investigar incidente em sistema multi-tenant sem poder filtrar por tenant Ã© procurar no escuro.
- **Sentry** â€” sem captura de exceÃ§Ã£o, eu descubro o erro pelo usuÃ¡rio reclamando.
- **Migration no CI, nÃ£o no boot** â€” em serverless vÃ¡rias instÃ¢ncias sobem em paralelo e tentariam migrar ao mesmo tempo.

---

## 10. SeguranÃ§a

| Item | Escolha |
|---|---|
| CabeÃ§alhos HTTP | helmet |
| CSP | Restritiva, sem `unsafe-inline` |
| Rate limit | Por IP e por usuÃ¡rio, com contador no Postgres |
| Segredos | Environment variables da Vercel, fora do repositÃ³rio |
| `service_role` key do Supabase | Somente na API, nunca no bundle do front |
| Auditoria | Tabela append-only com ator, tenant, aÃ§Ã£o e recurso |

- **helmet** â€” cabeÃ§alho de seguranÃ§a ausente Ã© achado de pentest previsÃ­vel e barato de evitar.
- **CSP restritiva** â€” com o token acessÃ­vel ao JavaScript, a CSP Ã© a principal defesa contra roubo de sessÃ£o; e mesmo com cookie, ela impede o XSS de agir em nome do usuÃ¡rio.
- **Rate limit em Postgres** â€” `@nestjs/throttler` em memÃ³ria nÃ£o funciona em serverless, porque cada instÃ¢ncia tem contador prÃ³prio e o limite nunca Ã© atingido.
- **`service_role` sÃ³ na API** â€” essa chave ignora RLS; no bundle do front ela dÃ¡ acesso total ao banco para qualquer visitante.
- **Auditoria desde o inÃ­cio** â€” sistema de TI precisa responder quem mudou o quÃª; retrofitar log de auditoria depois nÃ£o recupera o passado.

---

## 11. Qualidade de cÃ³digo

| Item | Escolha |
|---|---|
| Lint e formataÃ§Ã£o | ESLint + Prettier, config replicada nos dois repositÃ³rios |
| Hook de prÃ©-commit | lint-staged + husky, apenas lint e formataÃ§Ã£o |
| ConvenÃ§Ã£o de commit | Nenhuma automaÃ§Ã£o; mensagem escrita pela pessoa |

- **Config replicada** â€” com repositÃ³rios separados nÃ£o hÃ¡ pacote comum; a duplicaÃ§Ã£o Ã© aceita e a divergÃªncia Ã© resolvida na revisÃ£o.
- **PrÃ©-commit sÃ³ de lint** â€” barra o erro trivial antes do CI sem interferir na mensagem de commit.
- **Sem commitlint** â€” a mensagem Ã© responsabilidade de quem commita; validaÃ§Ã£o automÃ¡tica de formato seria cerimÃ´nia sem changelog gerado para justificar.

---

## Alternativas descartadas (material para a seÃ§Ã£o do ADR)

| Alternativa | Motivo do descarte |
|---|---|
| Monorepo com pacote de contrato compartilhado | Contraria a decisÃ£o de repositÃ³rios separados |
| ts-rest | Exige que os dois lados importem o mesmo pacote, que nÃ£o existe com repositÃ³rios separados |
| Pacote npm privado com os tipos | Bump de versÃ£o a cada campo alterado Ã© atrito maior que o ganho |
| RLS como autorizaÃ§Ã£o primÃ¡ria | O Prisma conecta com role dono da tabela e bypassa RLS; fazer valer exigiria transaÃ§Ã£o com `SET LOCAL` por request |
| Front falando direto com o Supabase, sem API | Tira o lugar onde regra de negÃ³cio e segredo de integraÃ§Ã£o podem viver, e faria a tela driblar a autorizaÃ§Ã£o por tenant |
| Cadastro aberto por e-mail | Sem domÃ­nio corporativo para filtrar, qualquer pessoa com a URL criaria conta |
| SSO corporativo (OIDC/SAML) | NÃ£o hÃ¡ e-mail corporativo para federar |
| Cookie `httpOnly` para a sessÃ£o | `vercel.app` estÃ¡ na Public Suffix List; sem domÃ­nio prÃ³prio o cookie nÃ£o atravessa do front para a API |
| DomÃ­nio prÃ³prio com subdomÃ­nios | Custo e configuraÃ§Ã£o que o escopo da disciplina nÃ£o justifica |
| Supabase CLI como dono das migrations | Dois donos de schema no mesmo banco se sobrescrevem |
| BullMQ, pg-boss ou qualquer fila | Sem volume assÃ­ncrono conhecido; e worker de vida longa nÃ£o roda na Vercel |
| Vercel Cron | Sem caso de uso agendado no escopo atual |
| Schema ou banco por tenant | Multiplicaria cada migration pelo nÃºmero de tenants sem exigÃªncia regulatÃ³ria que justifique |
| `@nestjs/throttler` em memÃ³ria | Contador por instÃ¢ncia nÃ£o limita nada em ambiente que escala horizontalmente |
| tRPC | Fecha a porta para consumidor nÃ£o-TypeScript; REST foi decidido antes |
| GraphQL | Custo de schema, resolver e cache nÃ£o se paga no volume de telas atual |
| Cliente HTTP escrito Ã  mÃ£o | Reescrever o tipo da resposta anula o ganho de TypeScript nas duas pontas |
| `class-validator` | NÃ£o gera o OpenAPI a partir do mesmo schema que valida a entrada |
| Prisma mockado nos testes de repositÃ³rio | Testa o mock; constraint, transaÃ§Ã£o e policy nÃ£o sÃ£o exercitadas |
| Jest no frontend | Exige pipeline de transform paralelo ao do Vite |
| Redux Toolkit | O estado de cliente restante Ã© pequeno demais para o boilerplate |
| Biblioteca de componentes fechada (MUI, Mantine) | O design vem do Figma e precisaria ser imposto por cima do visual da biblioteca |
| Next.js | NÃ£o preciso de SSR; teria dois backends no mesmo projeto |
| VPS ou container (Fly, ECS) para a API | Resolveria regiÃ£o, worker, WebSocket e uso justo, mas contraria a decisÃ£o de hospedagem |

---

## ConsequÃªncias (material para a seÃ§Ã£o do ADR)

**Fica mais fÃ¡cil**
- PermissÃ£o, histÃ³rico e release do front e da API ficam separados.
- Testar service sem subir a aplicaÃ§Ã£o, e testar repositÃ³rio contra banco real.
- Auditar autorizaÃ§Ã£o: a decisÃ£o estÃ¡ em um lugar (CASL), nÃ£o espalhada em `if`.
- Deploy: push na branch, sem pipeline de container para manter.
- Custo de infraestrutura prÃ³ximo de zero enquanto o volume for baixo.

**Fica mais difÃ­cil**
- MudanÃ§a de contrato nÃ£o quebra o build do front sozinha; depende de regenerar o cliente e da checagem no CI.
- Alterar uma feature que toca os dois lados exige dois PRs coordenados em repositÃ³rios diferentes.
- LatÃªncia: com as functions nos EUA e o banco em SÃ£o Paulo, cada query paga a travessia.
- Cold start: a primeira invocaÃ§Ã£o depois de ociosidade paga o bootstrap do Nest.
- Qualquer operaÃ§Ã£o precisa caber em 60s, o que obriga a desenhar importaÃ§Ã£o e relatÃ³rio em lotes.
- Envio de e-mail e integraÃ§Ã£o externa seguram a resposta do request.
- Manter guards e RLS coerentes exige disciplina â€” policy desatualizada dÃ¡ falsa sensaÃ§Ã£o de proteÃ§Ã£o.
- O token de sessÃ£o fica acessÃ­vel ao JavaScript, entÃ£o qualquer XSS ou dependÃªncia comprometida vira sequestro de sessÃ£o; a CSP Ã© a Ãºnica barreira.
- Config de lint duplicada nos dois repositÃ³rios pode divergir sem ninguÃ©m notar.

**O que isso impede de fazer depois sem custo**
- Qualquer funcionalidade com conexÃ£o aberta (notificaÃ§Ã£o em tempo real, terminal remoto, streaming de log): a Vercel nÃ£o suporta WebSocket.
- Processamento longo (importaÃ§Ã£o grande, varredura de rede, relatÃ³rio pesado): estoura o limite de execuÃ§Ã£o.
- Trabalho agendado ou assÃ­ncrono: exige introduzir fila e um lugar para o worker rodar, que nÃ£o Ã© a Vercel.
- Deixar o front falar direto com o Supabase para uma tela especÃ­fica: essa tela passa a driblar a autorizaÃ§Ã£o por tenant.
- Trocar Prisma por outro ORM: as migrations e o SQL de RLS estÃ£o dentro do Prisma Migrate.
- Sair do Supabase: Auth, banco e polÃ­ticas estÃ£o acoplados ao projeto.
- Adicionar `tenant_id` a uma tabela criada sem ele: exige backfill e revisÃ£o de toda query que a toca.
- Federar com identidade corporativa depois: exige migrar os usuÃ¡rios jÃ¡ cadastrados por e-mail e senha.
- Trocar para cookie `httpOnly`: exige domÃ­nio prÃ³prio, mover o login para dentro do Nest e refazer o tratamento de CORS e CSRF.
- Unir os repositÃ³rios depois: histÃ³rico separado e dependÃªncias divergentes tornam a junÃ§Ã£o um trabalho, nÃ£o um comando.

**DependÃªncia do contexto acadÃªmico**
- O plano Hobby sÃ³ vale enquanto o projeto for didÃ¡tico. Se a empresa passar a usar o sistema, Ã© preciso migrar para Pro antes, porque a conta hospeda outros projetos e a exposiÃ§Ã£o seria de conta, nÃ£o de projeto.

---

## O que este ADR nÃ£o decide

- Modelagem de domÃ­nio, entidades e relacionamentos.
- Design system, tokens e identidade visual.
- PapÃ©is e matriz de permissÃ£o dentro de cada tenant.
- Provisionamento de tenant: quem cria, como se convida usuÃ¡rio.
- Provedor de e-mail transacional e demais integraÃ§Ãµes.
- EstratÃ©gia de backup, retenÃ§Ã£o e plano de recuperaÃ§Ã£o.
- Ambientes (quantos, como sÃ£o promovidos) e polÃ­tica de branch.
- Feature flags.
- Observabilidade alÃ©m de log e erro (mÃ©trica, tracing distribuÃ­do).
- LGPD: base legal, polÃ­tica de retenÃ§Ã£o e fluxo de exclusÃ£o de dados.
- SLO, meta de latÃªncia e orÃ§amento de custo.