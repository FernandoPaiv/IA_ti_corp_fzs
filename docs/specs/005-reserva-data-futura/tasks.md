---
description: Tarefas de Reserva com data futura.
alwaysApply: false
---

# Tasks 005 — Reserva com data futura

> Sai do plan 005. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-04 | pendente | Migration `reservas` criada com `tenant_id`, `user_id`, `equipamento_id`, `data_retirada`, `status` e RLS |
| T-02 | CA-01, CA-04 | pendente | `ReservaRepository` implementado com create, findByEquipamento, findByUserAndTenant |
| T-03 | CA-01, CA-02, CA-03 | pendente | `ReservaService` cria reserva, faz lazy check de expiração e bloqueia equipamento |
| T-04 | CA-01, CA-02, CA-04, CA-05 | pendente | `POST /v1/reservas` valida body com Zod e retorna reserva criada |
| T-05 | CA-05 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-06 | CA-04 | pendente | Teste de isolamento: reserva do tenant A não afeta o tenant B (passando) |
| T-07 | CA-01, CA-02, CA-03 | pendente | Testes de contrato: status 201 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.