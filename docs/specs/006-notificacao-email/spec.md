---
description: Notificações por e-mail para eventos de empréstimo.
alwaysApply: false
---

# Spec 006 — Notificação por e-mail

> Leitor: agente  
> Fonte de requisitos: `layout.md` §7 (fora da v1: notificação por e-mail).

## Contexto
Funcionalidade fora da v1. Envia e-mails para usuários em eventos relevantes do ciclo de empréstimo.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Enviar e-mail quando um empréstimo é aprovado (para o usuário que solicitou). |
| CA-02 | Enviar e-mail quando um empréstimo está prestes a vencer (ex.: 1 dia antes da data prevista). |
| CA-03 | Enviar e-mail quando um item está em atraso (após a data prevista de devolução). |
| CA-04 | Isolamento por tenant: e-mails só são enviados para usuários do próprio tenant. |
| CA-05 | Endpoint interno de disparo de e-mail retorna RFC 9457 (Problem Details) em caso de erro. |

## Requisitos não funcionais
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT via guard — nunca do corpo/query.
- **Execução:** sem fila nem cron (ADR-001) — o envio de e-mail ocorre síncrono dentro da request que dispara o evento (ex.: ao aprovar empréstimo, ao verificar atraso na leitura).
- **Service de e-mail:** a escolha do provedor (SMTP, Supabase Auth, etc.) é decisão de implementação, não de spec.

## Fora de escopo
- Templates de e-mail (detalhe de front/implementação).
- Preferência de usuário para não receber e-mails (future spec).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".