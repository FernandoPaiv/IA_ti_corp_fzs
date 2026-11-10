---
description: Tarefas de Cadastro de equipamentos.
alwaysApply: false
---

# Tasks 004 — Cadastro de equipamentos

> Sai do plan 004. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-05 | pendente | Migration `equipamentos` tem `tenant_id` + RLS (deny by default) |
| T-02 | CA-06 | pendente | Guard CASL bloqueia `POST /v1/equipamentos` para usuários sem role operação/admin no tenant |
| T-03 | CA-01, CA-02, CA-03 | pendente | `EquipamentoRepository.create` insere com `tenant_id` do contexto |
| T-04 | CA-01, CA-02, CA-03, CA-04 | pendente | `EquipamentoService.create` define patrimônio `TI-—` quando vazio e ordena por criação desc |
| T-05 | CA-01, CA-02, CA-03, CA-05, CA-06 | pendente | `POST /v1/equipamentos` valida body com Zod e retorna equipamento criado |
| T-06 | CA-07 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-07 | CA-06 | pendente | Teste de autorização: usuário sem role operação recebe 403 (passando) |
| T-08 | CA-05 | pendente | Teste de isolamento: equipamento do tenant A não aparece no tenant B (passando) |
| T-09 | CA-01, CA-02, CA-03 | pendente | Testes de contrato: status 201 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.