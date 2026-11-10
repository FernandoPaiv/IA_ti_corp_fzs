---
description: Tarefas de Notificação por e-mail.
alwaysApply: false
---

# Tasks 006 — Notificação por e-mail

> Sai do plan 006. Cada tarefa cita um CA-xx que existe em spec.md e cabe num commit.

| Tarefa | CA | Status | Critério de aceite |
|--------|----|--------|--------------------|
| T-01 | CA-04 | pendente | Migration `notificacoes_email` criada com `tenant_id` e RLS |
| T-02 | CA-01, CA-02, CA-03 | pendente | `EmailService` implementado para aprovação, vencimento e atraso |
| T-03 | CA-01, CA-02, CA-03, CA-04 | pendente | Disparo de e-mail integrado aos fluxos de aprovação e leitura |
| T-04 | CA-01, CA-02, CA-03, CA-04, CA-05 | pendente | Controller de notificações valida body com Zod e dispara envio |
| T-05 | CA-05 | pendente | Erros retornam RFC 9457 (Problem Details) |
| T-06 | CA-04 | pendente | Teste de isolamento: tenant A não recebe notificação do tenant B (passando) |
| T-07 | CA-01, CA-02, CA-03 | pendente | Testes de contrato: status 200 + corpo com campos esperados (passando) |

Cada tarefa acima cabe em um único commit. Uma tarefa por vez.