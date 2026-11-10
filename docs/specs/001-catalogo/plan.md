---
description: Plano de implementação do catálogo de equipamentos.
alwaysApply: false
---

# Plan 001 — Catálogo de equipamentos

> Sai da spec 001. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** paginação cursor-based, erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, Zod + nestjs-zod para validação, Controller → Service → Repository, Postgres + Prisma.
- **ADR-002 (design system):** cores de situação (disponível/emprestado/manutenção), tipografia Raleway, tokens de cor — aplicável ao front (outro repo), citado aqui para alinhar os dados que o back deve expor (status, cor da pílula).

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-06 | Criar migration da tabela `equipamentos` com `tenant_id` + RLS (defense-in-depth) | Sim |
| T-02 | CA-01 | Implementar repository `EquipamentoRepository` (findAll com cursor, where tenant_id) | Sim |
| T-03 | CA-01, CA-06 | Implementar service `EquipamentoService` (busca por tenant, paginação cursor) | Sim |
| T-04 | CA-01, CA-03, CA-04, CA-06 | Implementar controller `EquipamentosController` `GET /v1/equipamentos` com Zod schema de query (busca, filtro, cursor) | Sim |
| T-05 | CA-07 | Centralizar tratamento de erros RFC 9457 para endpoint de equipamentos | Sim |
| T-06 | CA-06 | Escrever teste de isolamento: tenant A não vê equipamentos do tenant B | Sim |
| T-07 | CA-01, CA-02, CA-03, CA-04 | Escrever testes de contrato (status + corpo) do `GET /v1/equipamentos` | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.