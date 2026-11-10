---
description: Plano de implementação de Notificação por e-mail.
alwaysApply: false
---

# Plan 006 — Notificação por e-mail

> Sai da spec 006. Cita os ADRs que restringem esta implementação.

## ADRs que restringem
- **ADR-001 (stack):** erro RFC 9457, multi-tenancy por `tenant_id` via JWT guard, sem fila nem cron (envio síncrono na request), Zod + nestjs-zod, Controller → Service → Repository.

## Tarefas (sai de tasks.md)

| Tarefa | CA | Descrição | Cabe num commit? |
|--------|----|-----------|------------------|
| T-01 | CA-04 | Criar migration da tabela `notificacoes_email` (log de envio) com `tenant_id` + RLS | Sim |
| T-02 | CA-01, CA-02, CA-03 | Implementar service `EmailService` (envio de e-mail para aprovação, vencimento, atraso) | Sim |
| T-03 | CA-01, CA-02, CA-03, CA-04 | Integrar disparo de e-mail nos fluxos de Operações (aprovação) e leitura (atraso) | Sim |
| T-04 | CA-01, CA-02, CA-03, CA-04, CA-05 | Implementar controller de disparo de notificações com Zod schema | Sim |
| T-05 | CA-05 | Centralizar tratamento de erros RFC 9457 para endpoints de notificação | Sim |
| T-06 | CA-04 | Escrever teste de isolamento: notificação do tenant A não é disparada para usuário do tenant B | Sim |
| T-07 | CA-01, CA-02, CA-03 | Escrever testes de contrato (status + corpo) dos endpoints de notificação | Sim |

## Ordem de execução
Uma tarefa por vez. Ao terminar cada uma, seguir `rules/checks.md`.