---
description: Plano de implementação de Reserva com data futura.
alwaysApply: false
---

# Plan 005 — Reserva com data futura

> Sai da spec 005. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, sem fila nem cron (expiração lazy), Zod + nestjs-zod, Controller → Service → Repository, Postgres + Prisma.

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-04 | Criar migration da tabela `reservas` com `tenant_id`, `user_id`, `equipamento_id`, `data_retirada`, `status` + RLS | Sim |
| T-02 | CA-01, CA-04 | Implementar repository `ReservaRepository` (create, findByEquipamento, findByUserAndTenant) | Sim |
| T-03 | CA-01, CA-02, CA-03 | Implementar service `ReservaService` (criar reserva, verificar expiração lazy, bloquear equipamento) | Sim |
| T-04 | CA-01, CA-02, CA-04, CA-05 | Implementar controller `ReservasController` `POST /v1/reservas` com Zod schema de body | Sim |
| T-05 | CA-05 | Centralizar tratamento de erros RFC 9457 para `POST /v1/reservas` | Sim |
| T-06 | CA-04 | Escrever teste de isolamento: reserva do tenant A não afeta o tenant B | Sim |
| T-07 | CA-01, CA-02, CA-03 | Escrever testes de contrato (status + corpo) do `POST /v1/reservas` | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.