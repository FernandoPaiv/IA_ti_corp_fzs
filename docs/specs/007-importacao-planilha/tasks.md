---
description: Tarefas de Importação de planilha.
alwaysApply: false
---

# Tasks 007 — Importação de planilha

> Sai do plan 007. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-05, CA-06 | pendente | Migration `equipamentos` tem `tenant_id` + RLS (deny by default) |
| T-02 | CA-06 | pendente | Guard CASL bloqueia `POST /v1/equipamentos/importar` para usuários sem role operação/admin no tenant |
| T-03 | CA-01, CA-02 | pendente | Parser de planilha (CSV/XLSX) mapeia colunas para campos de equipamento |
| T-04 | CA-03, CA-04, CA-05 | pendente | `EquipamentoService.importar` valida linha por linha, nome obrigatório, patrimônio `TI-—`, loteamento de 60s |
| T-05 | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07 | pendente | `POST /v1/equipamentos/importar` valida body com Zod e processa importação |
| T-06 | CA-07 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-07 | CA-06 | pendente | Teste de autorização: usuário sem role operação recebe 403 (passando) |
| T-08 | CA-05 | pendente | Teste de isolamento: equipamentos do tenant A não aparecem no tenant B (passando) |
| T-09 | CA-01, CA-02, CA-03, CA-04 | pendente | Testes de contrato: status 200/201 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.