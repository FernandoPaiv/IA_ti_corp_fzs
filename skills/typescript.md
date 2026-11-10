---
name: typescript
description: Skill genérica para desenvolvimento com TypeScript no projeto fzs do grilo.
---

# Skill: TypeScript

## Quando usar
Sempre que for escrever, revisar ou refatorar código TypeScript neste repositório (backend NestJS ou frontend React).

## Regras do projeto (AGENTS.md / ADR-001)

### Backend
- **Runtime:** Node.js LTS
- **Framework:** NestJS com Express
- **Layout:** pastas por domínio (`src/modules/<dominio>/`), camadas Controller → Service → Repository
- **Validação:** Zod via `nestjs-zod` (single source que valida input e gera OpenAPI; nada de `class-validator`)
- **Contexto de request:** `AsyncLocalStorage` com `tenant_id` e `user_id`
- **ORM:** Prisma (Prisma Migrate é o único dono do schema)
- **Testes:** Jest + supertest + Testcontainers (banco Postgres real, nunca mock)

### Frontend
- **Linguagem:** TypeScript em `strict` mode
- **Build/dev:** Vite
- **Roteamento:** React Router (data APIs)
- **Server state:** TanStack Query
- **Client state:** Zustand (pequeno — UI, filtros, wizard)
- **Formulários:** React Hook Form + `zodResolver`
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui (copiado para o repo)
- **API client:** gerado de `openapi.json` com orval — nunca escrito à mão
- **Testes:** Vitest (unit), Playwright (E2E)

## Padrões TypeScript

### Tipagem
- Sempre usar `strict: true` no `tsconfig.json`
- Evitar `any` — usar `unknown` quando o tipo não for conhecido
- Preferir interfaces para objetos, types para aliases e union types
- Usar `readonly` em arrays e objetos que não devem ser mutados
- Tipar retornos de funções explicitamente em serviços e controllers

### Zod (validação)
- Definir schemas Zod para toda entrada de API (controllers)
- Reutilizar schemas Zod para validação de formulários no front (via `zodResolver`)
- O schema Zod é a fonte de verdade para o OpenAPI (backend) e para o tipo do formulário (frontend)

### Multi-tenancy
- Todo service que acessa banco deve receber `tenant_id` do contexto (`AsyncLocalStorage`)
- Nunca aceitar `tenant_id` vindo do corpo ou query da requisição
- Todo teste de endpoint deve incluir caso de isolamento (tenant A não vê tenant B)

### Erros
- Erros de API seguem RFC 9457 (Problem Details): `type`, `title`, `status`, `detail`, `instance`
- Não vazar stack traces ou detalhes internos para o cliente

## Antes de declarar uma tarefa pronta
1. Rodar `npm test` (backend) ou testes unit/E2E (frontend) sem falha
2. Se tocou em migration: `npx prisma migrate reset --force` local e confirmar banco subindo do zero
3. Rodar `npm run build` antes de qualquer push
4. Rodar `git status --short` — só arquivos do escopo da tarefa
5. Todo endpoint tocado por tenant tem teste de isolamento

## Não faça
- Não use `any` sem justificativa documentada
- Não escreva cliente HTTP à mão no front (use orval gerado de `openapi.json`)
- Não use `class-validator` no backend (apenas Zod + nestjs-zod)
- Não rode testes contra banco remoto (use Postgres local/Testcontainers)
- Não escreva ADR nem escolha biblioteca fora do ADR-001 sem proposta ao time