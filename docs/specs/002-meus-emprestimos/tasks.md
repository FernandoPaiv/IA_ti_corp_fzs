---
description: Tarefas de Meus empréstimos.
alwaysApply: false
---

# Tasks 002 — Meus empréstimos

> Sai do plan 002. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-04 | pendente | Migration `emprestimos` criada com `tenant_id`, `user_id`, `equipamento_id`, datas, status e RLS |
| T-02 | CA-01, CA-04, CA-06 | pendente | `EmprestimoRepository.findByUserAndTenant` filtra por `tenant_id` + `user_id` e suporta cursor |
| T-03 | CA-01, CA-02, CA-04 | pendente | `EmprestimoService` retorna empréstimos do usuário logado no tenant atual |
| T-04 | CA-01, CA-02, CA-03, CA-04, CA-06 | pendente | `GET /v1/emprestimos/meus` responde com lista paginada de empréstimos do usuário |
| T-05 | CA-05 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-06 | CA-04 | pendente | Teste de isolamento: usuário A não vê empréstimos do usuário B (passando) |
| T-07 | CA-01, CA-02, CA-06 | pendente | Testes de contrato: status 200 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.