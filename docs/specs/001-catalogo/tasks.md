---
description: Tarefas do catálogo de equipamentos.
alwaysApply: false
---

# Tasks 001 — Catálogo de equipamentos

> Sai do plan 001. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-06 | pendente | Migration `equipamentos` criada com `tenant_id`, índice e RLS (deny by default) |
| T-02 | CA-01 | pendente | `EquipamentoRepository.findAll` filtra por `tenant_id` e suporta cursor-based pagination |
| T-03 | CA-01, CA-06 | pendente | `EquipamentoService` aplica busca por tenant e paginação cursor |
| T-04 | CA-01, CA-03, CA-04, CA-06 | pendente | `GET /v1/equipamentos` responde com lista paginada, busca e filtro de situação |
| T-05 | CA-07 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-06 | CA-06 | pendente | Teste de isolamento: tenant A não vê equipamentos do tenant B (passando) |
| T-07 | CA-01, CA-02, CA-03, CA-04 | pendente | Testes de contrato: status 200 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.