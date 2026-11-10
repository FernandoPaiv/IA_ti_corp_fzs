---
description: Plano de implementação de Importação de planilha.
alwaysApply: false
---

# Plan 007 — Importação de planilha

> Sai da spec 007. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, autorização CASL por role e tenant, execução em lotes de 60s (sem fila), Zod + nestjs-zod, Controller → Service → Repository, Postgres + Prisma.

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-05, CA-06 | Garantir migration `equipamentos` com `tenant_id` + RLS | Sim |
| T-02 | CA-06 | Implementar guard de autorização CASL (role operação/admin no tenant) para importação | Sim |
| T-03 | CA-01, CA-02 | Implementar parser de planilha (CSV/XLSX) com mapeamento de colunas | Sim |
| T-04 | CA-03, CA-04, CA-05 | Implementar service `EquipamentoService.importar` (valida linha por linha, nome obrigatório, patrimônio padrão `TI-—`, loteamento de 60s) | Sim |
| T-05 | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07 | Implementar controller `EquipamentosController` `POST /v1/equipamentos/importar` com Zod schema | Sim |
| T-06 | CA-07 | Centralizar tratamento de erros RFC 9457 para `POST /v1/equipamentos/importar` | Sim |
| T-07 | CA-06 | Escrever teste de autorização: usuário sem role operação recebe 403 | Sim |
| T-08 | CA-05 | Escrever teste de isolamento: equipamentos importados no tenant A não aparecem no tenant B | Sim |
| T-09 | CA-01, CA-02, CA-03, CA-04 | Escrever testes de contrato (status + corpo) do `POST /v1/equipamentos/importar` | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.