---
description: Plano de implementação de Operações.
alwaysApply: false
---

# Plan 003 — Operações

> Sai da spec 003. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** paginação cursor-based, erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, autorização CASL por role e tenant, tabela de auditoria append-only, Zod + nestjs-zod, Controller → Service → Repository.
- **ADR-002 (design system):** cores de situação e pills — citado para alinhar dados que o back expõe (status do equipamento/empréstimo).

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-06 | Garantir migration `emprestimos` e `equipamentos` com `tenant_id` + RLS | Sim |
| T-02 | CA-07 | Implementar guard de autorização CASL (role operação/admin no tenant) | Sim |
| T-03 | CA-01, CA-05, CA-06 | Implementar repository `OperacaoRepository` (listar empréstimos do tenant com filtros e cursor) | Sim |
| T-04 | CA-02, CA-03, CA-04 | Implementar service `OperacaoService` (aprovar empréstimo, registrar devolução, mover manutenção) | Sim |
| T-05 | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07 | Implementar controller `OperacoesController` (endpoints de Operações) com Zod schemas | Sim |
| T-06 | CA-08 | Centralizar tratamento de erros RFC 9457 para endpoints de Operações | Sim |
| T-07 | CA-07 | Escrever teste de autorização: usuário sem role operação recebe 403 | Sim |
| T-08 | CA-06 | Escrever teste de isolamento: operador tenant A não vê dados do tenant B | Sim |
| T-09 | CA-01, CA-02, CA-03, CA-04 | Escrever testes de contrato (status + corpo) dos endpoints de Operações | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.