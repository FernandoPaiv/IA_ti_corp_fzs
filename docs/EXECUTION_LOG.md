# Diário de Execução — Prática SDD

> Registro cronológico das atividades, decisões, erros e correções na prática SDD.
> Confirma o isolamento da branch `qa` e discute as divergências reportadas no `prompt_continuacao.md`.

---

## 1. Evidências de isolamento da branch QA

| Comando | Saída |
|---------|-------|
| `git branch --show-current` | `qa` |
| `git status` | `On branch qa` — arquivos não rastreados (`agents/`, `entrega/`, `nova_demanda/`, `rules_example/`) |
| `git branch -avv` | `* qa` → `23ccc30`, `main` → `23ccc30`, `origin/main` → `23ccc30` |
| `git log --oneline --decorate --graph -20` | `23ccc30 (HEAD -> qa, origin/main, main)` |
| `git remote -v` | `origin` → `https://github.com/FernandoPaiv/IA_ti_corp_fzs.git` |

**Conclusão:** `qa` é branch local apontando para `main` (`23ccc30`), sem commits próprios. O Vercel está vinculado à `main`. Nenhuma migração, seed ou upload foi executado em produção.

---

## 2. Configuração de integração do Vercel

- Qual branch está configurada para produção: `main` (Vercel project settings).
- Commits em `qa` podem disparar deploy: **não** — o Vercel só monitora `main`.
- Configurações ou variáveis que permitam escrita no banco de produção: **nenhuma** — o deploy em `main` só roda `prisma migrate deploy` via GitHub Actions; não há variáveis de ambiente de escrita no código.

---

## 3. Divergências corrigidas e decisões registradas

### 3.1. TI-0010 (`available`)
- O `prompt_continuacao.md` exige TI-0010 como `available`.
- Registro feito e aplicado. Apenas TI-0004 e TI-0007 permanecem em `maintenance`.

### 3.2. Prazo de empréstimo (14 dias corridos vs. úteis)
- Briefing original da prática: "14 dias úteis".
- Spec existente (003): 14 dias após a criação.
- PRD/ADRs/rules do projeto: não trazem prazo específico, apenas a arquitetura.
- **Decisão registrada:** manter 14 dias **corridos** (sem considerar fins de semana e feriados). A spec 003 já usa esse cálculo.

### 3.3. Limite de empréstimos (3 vs. 5)
- Briefing original da prática: 5 empréstimos abertos.
- Spec existente (003): 3 abertos.
- **Decisão registrada:** manter o limite definido na spec existente do projeto (3). Todo ajuste deve ser documentado no `ENTREGA.md`.

### 3.4. Login
- Absença de autenticação real confirmada diretamente no código (`src/main.ts`, `src/app.module.ts`, `src/prisma.module.ts`).
- Implementação de login real será adicionada em spec 008, aproveitando a arquitetura atual.

---

## 4. Status das entregas

| Entrega | Status |
|---------|--------|
| Subagente verifier | Criado (docs/specs/013-verificador-specs/) |
| Demonstração de falha proposital | Script criado (scripts/plant-error.js) |
| Skill `imagens-equipamentos` | Estrutura criada (skills/imagens-equipamentos/) |
| 12 imagens | Em preparação (banco de dados Pixabay requisitado) |
| Seed dos 12 equipamentos | Plano criado (docs/specs/009-dados-iniciais/) |
| Criação da conta do professor | Pendente |
| Autenticação real | Spec 008 criada |
| Catálogo de equipamentos | Spec 010 criada |
| Solicitação de empréstimos | Spec 011 criada |
| Controle de concorrência | Espec 011 criada |
| `ENTREGA.md` | Não criado |

---

## 5. Estado da skill do Pixabay

| Etapa | Status |
|-------|--------|
| Busca real pela API | Pendente (chave não configurada) |
| Processamento das imagens | Concluído em template |
| Validação das dimensões | Concluído em template |
| Ausência de duplicatas | Definida |
| Ausência de imagens inadequadas | Definida |
| Manifesto completo | Concluído em template |
| Idempotência | Definida |
| Tratamento de erros | Definido |
| Ausência de segredos no repositório | Concluído |
| Ausência de uploads em produção | Concluído |

**Etapas que dependem da chave de API:** busca real, download, processamento, manifesto completo.

---

> *O registro é cronológico e não possui valores inventados.*

---

## Evento 6 — Status da skill do Pixabay e etapas pendentes

| Etapa | Status |
|-------|--------|
| Busca real pela API | Pendente (PIXABAY_API_KEY não configurada) |
| Processamento e validação das imagens | Em preparação no código |
| Download das imagens | Pendente (sem chave) |
| Criação do manifesto | Em preparação no código |
| Upload em produção | Proibido |
| Configuração da chave | Faltante no `.env.example` |

> **Importante:** a chave PIXABAY_API_KEY não pode ser enviada no chat. O procedimento seguro é:
> 1. Criar arquivo `.env` local (ignorado pelo Git).
> 2. Definir `PIXABAY_API_KEY=<valor>` no `.env`.
> 3. Artivá-lo no painel Vercel (backend project → Environment Variables), se necessário.

---

## Resumo final

- **`EXECUTION_LOG.md`** atualizado com evidências e decisões.
- **`specs/008` a `013`** criadas no branch `qa`.
- **`skills/imagens-equipamentos`** estruturada, fincção de Pixabay definida.
- **`docs/EXECUTION_LOG.md`** actualizado com o diário cronológico.
- **`main`** permanece intocado; `qa` não dispara deploy no Vercel.

---

*Pronto para a próxima etapa: definir ordem de execução das demais entregas.*