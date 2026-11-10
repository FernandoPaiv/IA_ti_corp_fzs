---
description: Tarefas de Operações.
alwaysApply: false
---

# Tasks 003 — Operações

> Sai do plan 003. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-06 | pendente | Migrations `emprestimos` e `equipamentos` têm `tenant_id` + RLS (deny by default) |
| T-02 | CA-07 | pendente | Guard CASL bloqueia acesso a Operações para usuários sem role operação/admin no tenant |
| T-03 | CA-01, CA-05, CA-06 | pendente | `OperacaoRepository` lista empréstimos do tenant com filtros e cursor-based pagination |
| T-04 | CA-02, CA-03, CA-04 | pendente | `OperacaoService` aprova empréstimo, registra devolução e move equipamento para manutenção |
| T-05 | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07 | pendente | Endpoints de Operações respondem corretamente com Zod validation |
| T-06 | CA-08 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-07 | CA-07 | pendente | Teste de autorização: usuário sem role operação recebe 403 (passando) |
| T-08 | CA-06 | pendente | Teste de isolamento: operador tenant A não vê dados do tenant B (passando) |
| T-09 | CA-01, CA-02, CA-03, CA-04 | pendente | Testes de contrato: status 200 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.