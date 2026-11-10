---
description: Plano de implementação de Cadastro de equipamentos.
alwaysApply: false
---

# Plan 004 — Cadastro de equipamentos

> Sai da spec 004. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, autorização CASL por role e tenant, Zod + nestjs-zod para validação de entrada, Controller → Service → Repository, Postgres + Prisma.
- **ADR-002 (design system):** tokens de cor e tipografia — citado para alinhar o que o front exibe, não afeta o back diretamente.

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-05 | Garantir migration `equipamentos` com `tenant_id` + RLS | Sim |
| T-02 | CA-06 | Implementar guard de autorização CASL (role operação/admin no tenant) para cadastro | Sim |
| T-03 | CA-01, CA-02, CA-03 | Implementar repository `EquipamentoRepository` (create com tenant_id) | Sim |
| T-04 | CA-01, CA-02, CA-03, CA-04 | Implementar service `EquipamentoService.create` (patrimônio padrão `TI-—`, ordenação por criação desc) | Sim |
| T-05 | CA-01, CA-02, CA-03, CA-05, CA-06 | Implementar controller `EquipamentosController` `POST /v1/equipamentos` com Zod schema de body | Sim |
| T-06 | CA-07 | Centralizar tratamento de erros RFC 9457 para `POST /v1/equipamentos` | Sim |
| T-07 | CA-06 | Escrever teste de autorização: usuário sem role operação recebe 403 | Sim |
| T-08 | CA-05 | Escrever teste de isolamento: equipamento do tenant A não aparece no tenant B | Sim |
| T-09 | CA-01, CA-02, CA-03 | Escrever testes de contrato (status + corpo) do `POST /v1/equipamentos` | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.