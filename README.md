# IA_ti_corp_fzs
Repositório para armazenar uma aplicação fzs do grilo

Backend (API) do **EMPREST.AI** — sistema de empréstimo de equipamentos de TI.
NestJS + Express, hospedado na Vercel. Decisões em `docs/adr/001-stack.md`.

## Deploy na Vercel (backend)

A Vercel tem **detecção zero-config de NestJS**: ela encontra o entrypoint
`src/server.ts` e compila o projeto sozinha. **Não** defina build nem output.

> Se aparecer o erro **"No Output Directory named `public` found after the Build
> completed"**, a configuração do **painel** está sobrepondo a detecção. Isso não
> se resolve no código — ajuste o projeto na Vercel.

### Configuração do projeto (painel da Vercel)

Settings → **Build & Development Settings** — deixe os overrides **DESLIGADOS**:

| Campo | Valor |
| --- | --- |
| Framework Preset | `NestJS` (ou Autodetect — **não** "Other") |
| Build Command | *override desligado* (vazio) |
| Output Directory | *override desligado* (vazio, sem `public`) |
| Install Command | *override desligado* |
| Root Directory | vazio (raiz do repositório) |

O ponto que causa o erro é o **Output Directory com override salvo**. Apague-o.

### Variáveis de ambiente (painel → Environment Variables)

| Nome | Valor (produção) |
| --- | --- |
| `DATABASE_URL` | connection string do Supabase (pooler, porta 6543) |
| `DIRECT_URL` | connection string direta (porta 5432, usada nas migrations) |
| `FRONTEND_ORIGIN` | `https://ia-ti-corp-fzs-front-git-main-fezes-team.vercel.app` |

`.env.example` documenta os valores sem segredo. O `.env` real é local e não vai
para o repositório (`rules/secrets.md`).

### URLs

- Back (esta API): `https://ia-ti-corp-fzsbackend.vercel.app`
- Front: `https://ia-ti-corp-fzs-front-git-main-fezes-team.vercel.app`

## Comandos

```bash
npm run dev      # ts-node src/server.ts (API local, http://localhost:3000)
npm run build    # tsc -p tsconfig.json
npm start        # node dist/server.js
npm test         # jest --runInBand
```

Endpoints: `GET /v1/health` (liveness) e `GET /v1/health/db` (ping ao banco).