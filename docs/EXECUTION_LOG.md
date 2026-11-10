# Diário de Execução — Prática SDD

> Registro cronológico das atividades, decisões, erros e correções na prática SDD.
> Confirma o isolamento da branch `qa` e discute as divergências reportadas no `prompt_continuacao.md` e `continuacao2.md`.

---

## 1. Evidências de isolamento da branch QA

| Comando | Saída |
|---------|-------|
| `git branch --show-current` | `qa` |
| `git status` | `On branch qa` — arquivos não rastreados (`entrega/`, `entrega_Fernando_Henrique_de_Paiva.zip`, `node_modules.zip`, `rules_example/`) |
| `git branch -avv` | `* qa` → `8238b6b`, `main` → `23ccc30`, `origin/main` → `23ccc30`, `origin/qa` → `8238b6b` |
| `git log --oneline --decorate --graph -20` | `8238b6b (HEAD -> qa, origin/qa)` `4743151` `23ccc30` `d711621` `c0f18b7` `3dee433` |
| `git remote -v` | `origin` → `https://github.com/FernandoPaiv/IA_ti_corp_fzs.git` |

**Conclusão:** `qa` é branch local apontando para `main` (`23ccc30`), com commits próprios `4743151` e `8238b6b`. O Vercel está vinculado à `main`. Nenhuma migração, seed ou upload foi executado em produção.

---

## 2. Configuração de integração do Vercel

- Qual branch está configurada para produção: `main` (Vercel project settings).
- Commits em `qa` podem disparar deploy: **não** — o Vercel só monitora `main`.
- Configurações ou variáveis que permitam escrita no banco de produção: **nenhuma** — o deploy em `main` só roda `prisma migrate deploy` via GitHub Actions; não há variáveis de ambiente de escrita no código.

---

## 3. Conflitos documentais (decisão pendente de aprovação)

| # | Requisito | Trecho exato do briefing | Trecho exato do PRD/ADR (se divergência) | Documento priorizado | Decisão registrada | Justificativa |
|---|-----------|--------------------------|------------------------------------------|----------------------|-------------------|---------------|
| 1 | Prazo de empréstimo | "devolução prevista para 14 dias úteis depois" (briefing solicitação) | PRD e ADRs estabelecem 14 dias após a criação (spec 003) | **PRD/ADR 3** (regras vigentes do negócio) | **14 dias corridos** | O usuário confirmou que as regras do PRD/ADR 3 prevalecem sobre o briefing. A divergência é tratada como parte da pegadinha da atividade, não como mudança formal de negócio. |
| 2 | Limite de empréstimos abertos | "Quem já tem 5 empréstimos em aberto não pode solicitar outro" (briefing solicitação) | PRD e ADRs estabelecem 3 empréstimos em aberto (spec 003) | **PRD/ADR 3** (regras vigentes do negócio) | **3 empréstimos** abertos | O usuário confirmou que as regras do PRD/ADR 3 prevalecem sobre o briefing. A divergência é tratada como parte da pegadinha da atividade, não como mudança formal de negócio. |
| 3 | TI-0010 situação | "TI-0010 ... Manutenção" (pequadinhas-e-especificacoes.md tabela) | "TI-0010 ... Manutenção" (pegadinhas) | **`prompt_continuacao.md`** (decisão posterior do usuário) | `available` | O usuário solicitou correção explícita em `prompt_continuacao.md` |

---

## 4. Status das especificações (corrigidas ou aguardando aprovação)

| Spec | Arquivo | Status | Observação |
|------|---------|--------|------------|
| 001-catalogo | `docs/specs/001-catalogo/` | Existente | Criada anteriormente; não alterada |
| 002-meus-emprestimos | `docs/specs/002-meus-emprestimos/` | Existente | Criada anteriormente; não alterada |
| 003-operacoes | `docs/specs/003-operacoes/` | Existente | Limite 3 confirmado (PRD/ADR 3); não alterado |
| 004-cadastro-equipamentos | `docs/specs/004-cadastro-equipamentos/` | Existente | Criada anteriormente; não alterada |
| 005-reserva-data-futura | `docs/specs/005-reserva-data-futura/` | Existente | Criada anteriormente; não alterada |
| 006-notificacao-email | `docs/specs/006-notificacao-email/` | Existente | Criada anteriormente; não alterada |
| 007-importacao-planilha | `docs/specs/007-importacao-planilha/` | Existente | Criada anteriormente; não alterada |
| 008-login-real | `docs/specs/008-login-real/` | Criada | Aguarda aprovação para implementar |
| 009-dados-iniciais | `docs/specs/009-dados-iniciais/` | Criada | TI-0010 corrigido para `available` |
| 010-catalogo-autenticado | `docs/specs/010-catalogo-autenticado/` | Criada | Aguarda aprovação para implementar |
| 011-solicitacao-emprestimo | `docs/specs/011-solicitacao-emprestimo/` | Criada | Limite 3 confirmado (PRD/ADR 3); não alterado |
| 012-skill-imagens-equipamentos | `docs/specs/012-skill-imagens-equipamentos/` | Criada | Pixabay configurada como fonte |
| 013-verificador-specs | `docs/specs/013-verificador-specs/` | Criada | Aguarda aprovação para operacionalizar |

---

## 5. Estado real dos testes do verifier

| Item | Status | Evidência |
|------|--------|-----------|
| Subagente verificador definido | Criado | `docs/specs/013-verificador-specs/` |
| Scripts de verificação e erro plantado | **Não criados** | Pasta `scripts/` não existe no repositório |
| Demonstração de erro proposital | **Não executada** | Nenhuma prova de erro plantado/reversão realizada |
| Teste de reversão | **Não executado** | Nenhuma reversão efetuada |
| Testes de execução | **Não executados** | Nenhum teste rodado |
| Limitações declaradas | Documentadas | `docs/specs/013-verificador-specs/spec.md` |

**Conclusão:** O subagente verificador tem sua especificação criada, mas **não foi implementado como script executável** nem foi realizada a demonstração de erro proposital e reversão exigidas.

---

## 6. Estado da skill Pixabay

| Item | Status | Evidência |
|------|--------|-----------|
| Estrutura da skill | Criada | `skills/imagens-equipamentos/` com `SKILL.md` |
| Scripts de busca/processamento | **Não criados** | Pasta `scripts/` não existe em `skills/imagens-equipamentos/` |
| Busca real pela API Pixabay | **Não executada** | Chave PIXABAY_API_KEY não configurada |
| Download de imagens | **Não executado** | Sem chave de API |
| Processamento com Sharp | **Não executado** | Sem imagens baixadas |
| Validação de dimensões 800×600 | **Não executada** | Sem imagens processadas |
| Manifesto de imagens | **Não criado** | Sem imagens para registrar |
| Idempotência | **Não testada** | Sem execução |
| Tratamento de erros | **Não testado** | Sem execução real |
| Ausência de segredos no repositório | Concluída | `PIXABAY_API_KEY=""` no `.env.example`, sem valor real |
| Ausência de uploads em produção | Concluída | Nenhuma escrita em produção |
| `.env` protegido pelo `.gitignore` | Concluído | `.env` está listado no `.gitignore` |

**Conclusão:** A skill tem apenas a estrutura de instruções (`SKILL.md`). Nenhum script de busca, download, processamento ou validação foi implementado. Busca real depende da chave PIXABAY_API_KEY configurada pelo usuário no `.env` local.

---

## 7. Confirmação de operações em produção

| Operação | Executada? | Evidência |
|----------|------------|-----------|
| Migração no banco de produção | Não | `git log` mostra apenas commits de documentação |
| Seed no banco de produção | Não | Nenhum dado inserido |
| Upload de imagens para Supabase Storage | Não | Nenhum arquivo enviado |
| Alteração de dados em produção | Não | `main` permanece intocado (commit `23ccc30`) |
| Deploy do backend/front | Não | Vercel vinculado a `main`; `qa` não dispara deploy |
| Escrita no banco ou Storage de produção | Não | Nenhuma operação de escrita realizada |

---

## 8. Arquivo `.env.example` com PIXABAY_API_KEY

| Item | Estado |
|------|--------|
| PIXABAY_API_KEY definida no `.env.example` | Sim — `PIXABAY_API_KEY=""` |
| Chave real versionada | Não — valor vazio, conforme exigido |
| `.env` protegido pelo `.gitignore` | Sim — `.env` está listado no `.gitignore` |
| `.env.bak` local | Existe (backup, ignorado pelo git) |

---

## 9. Pasta `nova_demanda/` no `.gitignore`

| Item | Estado |
|------|--------|
| `nova_demanda/` adicionada ao `.gitignore` | Sim — linha 19-21 do `.gitignore` |
| Arquivos rastreados pelo Git | Não — `git status --ignored` mostra `!! nova_demanda/` |
| Estrutura persistida no disco | Sim — arquivos acessíveis localmente |

---

## 10. Próximos passos (pendentes de aprovação)

| # | Ação | Dependência |
|---|------|-------------|
| 1 | Implementar login real (spec 008) | Pronto para iniciar |
| 2 | Implementar catálogo autenticado (spec 010) | Após login |
| 3 | Implementar solicitação de empréstimos (spec 011) | Após catálogo |
| 4 | Implementar scripts da skill Pixabay (busca, download, processamento, manifesto) | Após configuração de PIXABAY_API_KEY |
| 5 | Executar demonstração de erro proposital do verifier | Após scripts do verificador |
| 6 | Popular 12 equipamentos + conta do professor | Usuário executa no Supabase (agente não escreve em produção) |
| 7 | Criar `ENTREGA.md` | Final da prática |

---

> *O registro é cronológico e não possui valores inventados.*