---
description: Operações de empréstimo: aprovação, registro de devolução e manutenção de equipamentos.
alwaysApply: false
---

# Spec 003 — Operações

> Leitor: agente  
> Fonte de requisitos: `layout.md` §12 (item com outra pessoa, emprestado), `AGENTS.md` (multi-tenancy, CASL por role e tenant).

## Contexto
A tela Operações é a visão completa dos empréstimos do tenant. Apenas usuários com role de operação/admin no tenant podem acessar. Aqui se aprova empréstimos, registra devoluções e move equipamentos para manutenção.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Listar todos os empréstimos do tenant (todos os usuários), com paginação cursor-based. |
| CA-02 | Aprovar empréstimo pendente: muda status do equipamento para "emprestado" e cria registro de empréstimo com data e prazo. |
| CA-03 | Registrar devolução: muda status do equipamento para "disponível" e preenche data de devolução real no empréstimo. |
| CA-04 | Mover equipamento para manutenção (e voltar para disponível). |
| CA-05 | Filtros: por pessoa, por item, por situação (todos / disponíveis / emprestados / manutenção), case-insensitive. |
| CA-06 | Isolamento por tenant: operador do tenant A não vê nem opera dados do tenant B. |
| CA-07 | Autorização por role: apenas usuários com role de operação/admin no tenant podem acessar endpoints de Operações. |
| CA-08 | Endpoints retornam RFC 9457 (Problem Details) em caso de erro. |

## Requisitos não funcionais
- **Paginação:** cursor-based (ADR-001).
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT via guard — nunca do corpo/query.
- **Autorização:** CASL — regras por role **e** por tenant (ADR-001).
- **Auditoria:** toda ação de Operações gera registro na tabela append-only de auditoria (ator, tenant, action, resource) — ADR-001 §Security.

## Fora de escopo
- Reserva com data futura (espec 005).
- Notificação por e-mail (espec 006).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".