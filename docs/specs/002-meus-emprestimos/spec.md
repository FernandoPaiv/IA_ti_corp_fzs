---
description: Visualização dos empréstimos ativos do usuário logado.
alwaysApply: false
---

# Spec 002 — Meus empréstimos

> Leitor: agente  
> Fonte de requisitos: `layout.md` §11 (escopo por pessoa), §12 (item já com o usuário), `AGENTS.md` (multi-tenancy).

## Contexto
A tela "Meus empréstimos" mostra ao usuário logado somente os empréstimos ativos (ou históricos) sob seu nome dentro do tenant. Cada usuário vê apenas os próprios empréstimos; a visão completa de todos os empréstimos do tenant existe apenas em Operações (espec 003).

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Listar empréstimos do usuário logado no tenant atual, com item, data do empréstimo, data prevista de devolução e status. |
| CA-02 | Cada empréstimo exibe: nome do equipamento, patrimônio, status (emprestado / a vencer / atrasado / devolvido) e, se atrasado, banner de bloqueio (borda `#7a3b3b`, fundo `rgba(122,59,59,0.14)`, texto `#e88b8b`). |
| CA-03 | Botão "Está com você" (desabilitado) quando o item já está com o usuário logado; "Emprestado" (desabilitado) com detalhe de quem tem e o prazo, quando está com outra pessoa (apenas visualização, não ação). |
| CA-04 | Isolamento por tenant e por usuário: usuário A não vê empréstimos do usuário B, mesmo dentro do mesmo tenant. |
| CA-05 | Endpoint `GET /v1/emprestimos/meus` retorna RFC 9457 (Problem Details) em caso de erro. |
| CA-06 | Paginação cursor-based na listagem de empréstimos do usuário. |

## Requisitos não funcionais
- **Paginação:** cursor-based (ADR-001).
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT + `user_id` do `AsyncLocalStorage` — nunca do corpo/query.
- **Autorização:** CASL — usuário só pode ler próprios empréstimos (`user_id` igual ao do token).

## Fora de escopo
- Solicitar devolução antecipada (pode ser future spec).
- Aprovar/registrar empréstimos (espec 003 Operações).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".