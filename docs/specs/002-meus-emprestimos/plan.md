---
description: Plano de implementação de Meus empréstimos.
alwaysApply: false
---

# Plan 002 — Meus empréstimos

> Sai da spec 002. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** paginação cursor-based, erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard + `user_id` via AsyncLocalStorage, Zod + nestjs-zod, Controller → Service → Repository.
- **ADR-002 (design system):** cores de situação e banner de bloqueio — citado para alinhar dados que o back expõe (status do empréstimo).

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-04 | Criar migration da tabela `emprestimos` com `tenant_id`, `user_id`, `equipamento_id`, datas e status + RLS | Sim |
| T-02 | CA-01, CA-04, CA-06 | Implementar repository `EmprestimoRepository` (findByUserAndTenant com cursor) | Sim |
| T-03 | CA-01, CA-02, CA-04 | Implementar service `EmprestimoService` (busca empréstimos do usuário logado no tenant) | Sim |
| T-04 | CA-01, CA-02, CA-03, CA-04, CA-06 | Implementar controller `EmprestimosController` `GET /v1/emprestimos/meus` com Zod schema | Sim |
| T-05 | CA-05 | Centralizar tratamento de erros RFC 9457 para endpoint de meus empréstimos | Sim |
| T-06 | CA-04 | Escrever teste de isolamento: usuário A não vê empréstimos do usuário B no mesmo tenant | Sim |
| T-07 | CA-01, CA-02, CA-06 | Escrever testes de contrato (status + corpo) do `GET /v1/emprestimos/meus` | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.