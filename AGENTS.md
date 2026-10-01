# AGENTS.md

This file gives an agent the context it needs to work effectively in this repository. It is written for the **target architecture** defined in the Architectural Decision Record (see `docs/adr/001-stack.md`). The codebase is still being scaffolded, so where the implementation is incomplete, follow the target architecture below.

## Product

This project is a **system for borrowing and lending IT equipment**. It is a multi-tenant web application: each tenant represents one area/organization, and the system tracks IT assets (with inventory and spreadsheet import), who they are loaned to, and the support workflow around them — including tickets ("chamados"), asset registration, and a per-tenant isolation model. The working name of the app is "fzs do grilo" ("grilo" = the team, cricket). The default/first tenant created by the seed is `suporte_ti`.

## Repository structure

The project is split into **two separate GitHub repositories**, each with its own Vercel project:

| Side | Repository (remote) | Local working directory | Vercel project |
|---|---|---|---|
| Backend (API) | `IA_ti_corp_fzs.git` | `IA_ti_corp_tb` (this repo) | Backend project |
| Frontend | `IA_ti_corp_fzs_front.git` | `frontend-repo/` | Frontend project |

- There is **no shared npm package** between the two. The contract crosses the boundary as a **generated `openapi.json`** file. The frontend regenerates its API client from that file (with orval) and version it in the frontend repo.
- Run commands from the directory of the side you are working on: **backend** commands run from this repo root (`IA_ti_corp_tb`); **frontend** commands run from `frontend-repo/`.

## Conventions that apply to both repositories

These are intentionally **replicated** in both repos (the ADR accepts the duplication):

- **Lint & format:** ESLint + Prettier, with the config copied into each repository.
- **Pre-commit hook:** lint-staged + husky, limited to lint and formatting only (no commit-message automation).
- **Commit messages:** written by the person; no styling/format validation tooling.

## Backend (this repo)

### Stack (target)

- **Runtime:** Node.js LTS; **Framework:** NestJS.
- **HTTP adapter:** Express via `@vendia/serverless-express`, with a **cached application instance** created once outside the handler (avoids re-bootstrapping the DI container on every request on Vercel).
- **Layout:** folders by **domain** (`src/modules/<dominio>/`), layers **Controller → Service → Repository**.
- **Validation:** Zod via `nestjs-zod` (single source that both validates input and generates the OpenAPI; no `class-validator`).
- **Request context:** `AsyncLocalStorage` carrying `tenant_id` and `user_id`.

### Data & persistence

- **Database:** PostgreSQL managed by Supabase. **ORM:** Prisma.
- **Schema owner:** Prisma Migrate (the only owner). Supabase CLI is **not** a second owner.
- **Objects Prisma cannot model** (RLS policies, triggers, etc.): raw SQL inside the Prisma migrations.
- **Two connection endpoints:**
  - Runtime: Supavisor (pooler), port **6543**, `?pgbouncer=true&connection_limit=1`.
  - Migration: `directUrl`, port **5432**.
- **Seed:** `prisma/seed.ts`, **idempotent**, creates the `suporte_ti` tenant.
- **Env config:** validated with Zod at boot (fail fast rather than silent `undefined`).

### Multi-tenancy

- **Model:** single database, tenant discriminated by a `tenant_id` column present in **every** domain table.
- **User–tenant link:** `memberships (user_id, tenant_id, role)` — a person can act in more than one area with a different role in each.
- **Tenant origin:** from the **JWT claim, resolved in a guard — never from the request body/query**.
### API contract

- Style: REST with a **`/v1`** path prefix from the start.
- Source of truth: OpenAPI generated from the Zod schemas; distributed as `openapi.json` (CI artifact of the API).
- Error format: **RFC 9457 (Problem Details)**.
- Pagination: **cursor**-based (not offset).
- Real-time: out of scope (Vercel doesn't support WebSocket); the frontend uses polling via TanStack Query.

### Auth & authorization

- **Identity:** Supabase Auth, email + password.
- **Signup:** closed — invitation only by an administrator.
- **Session:** token in the **header**, managed by `supabase-js`.
- **Token verification:** the Nest API validates the JWT via **JWKS** from Supabase.
- **CORS:** allowlist with the front origin, `credentials` enabled.
- **Authorization source of truth:** Nest guards + **CASL** (rules are by role **and** by tenant).
- **RLS:** enabled on all tables (deny by default) as **defense-in-depth only, not the primary authorization** — the Prisma client connects with an owner role that bypasses RLS.

### Testing

- **Unit (backend):** Jest. **Integration (DB):** Testcontainers with real Postgres. **API:** supertest over the Nest app.
- **Mandatory test:** at least one tenant-isolation case per endpoint — tenant A must not see tenant B's data.
- No coverage-percentage target; critical paths are the testable criterion.

### Hosting & operations

- **Host:** Vercel (front and API, separate projects), **Hobby** plan; functions run in the default region (US).
- **Execution ceiling:** 60s per request — design long operations (imports, sync, large reports) in batches that fit.
- **No queue and no cron:** async/email/external work runs inside the request.
- **Logs:** pino in JSON with `request_id` and `tenant_id`. **Errors:** Sentry (API and front).
- **CI:** GitHub Actions, one workflow per repository. Migrations run via `prisma migrate deploy` in a CI job **before** deploy (not at boot, because serverless instances boot in parallel).
- **Secrets:** environment variables set in Vercel, **outside** the repository (and `.env` is git-ignored).

### Security

- **HTTP headers:** helmet. **CSP:** restrictive, no `unsafe-inline`.
- **Rate limit:** per IP and per user, counter in Postgres (in-memory throttler doesn't work in serverless).
- **`service_role` key:** only in the API, never in the frontend bundle.
- **Audit:** append-only table with actor, tenant, action, and resource.

## Frontend

Located in `frontend-repo/`. Stack (target):

- **Language:** TypeScript in `strict` mode.
- **UI:** React; **Build/dev:** Vite; **Routing:** React Router (data APIs).
- **Server state:** TanStack Query. **Client state:** Zustand (small — UI, filters, wizard).
- **Forms:** React Hook Form + `zodResolver`.
- **Styling:** Tailwind CSS. **Components:** shadcn/ui (component copied into the repo).
- **API client:** generated from `openapi.json` with **orval** — never written by hand.
- **Testing:** Vitest (unit), Playwright (browser E2E). The CI fails if the generated client diverges from the published `openapi.json`.

## Typical workflow notes

- After changing the API contract, regenerate `openapi.json` (backend) and regenerate the frontend client, so the contract verification in the frontend CI passes.
- The source of truth for authorization decisions is the application layer (guards + CASL), with RLS as the last line of defense.