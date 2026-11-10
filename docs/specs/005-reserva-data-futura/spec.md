---
description: Reserva de equipamento com data futura.
alwaysApply: false
---

# Spec 005 — Reserva com data futura

> Leitor: agente  
> Fonte de requisitos: `layout.md` §7 (fora da v1: reserva com data futura).

## Contexto
Funcionalidade fora da v1. Permite reservar um equipamento para retirada em uma data futura, bloqueando-o para outros usuários até essa data.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Reservar equipamento: usuário escolhe item e data futura de retirada; o equipamento fica marcado como "reservado" até a data. |
| CA-02 | Enquanto reservado, o equipamento não aparece como "disponível" no catálogo para outros usuários. |
| CA-03 | Se o usuário não retirar o equipamento na data prevista, a reserva expira automaticamente e o equipamento volta para disponível. |
| CA-04 | Isolamento por tenant: reserva do tenant A não afeta o tenant B. |
| CA-05 | Endpoint `POST /v1/reservas` retorna RFC 9457 (Problem Details) em caso de erro. |

## Requisitos não funcionais
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT via guard — nunca do corpo/query.
- **Validação:** Zod via nestjs-zod (ADR-001).
- **Execução:** sem fila nem cron (ADR-001) — a expiração de reserva é verificada no momento da leitura (lazy check), não por job assíncrono.

## Fora de escopo
- Notificação por e-mail de expiração (espec 006).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".