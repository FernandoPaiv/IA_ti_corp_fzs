---
description: Cadastro de equipamentos de TI no inventário do tenant.
alwaysApply: false
---

# Spec 004 — Cadastro de equipamentos

> Leitor: agente  
> Fonte de requisitos: `layout.md` §10 (cadastro), §9 (dados de exemplo), `AGENTS.md` (multi-tenancy, CASL).

## Contexto
O cadastro de equipamentos permite adicionar novos itens ao inventário do tenant. Nome é obrigatório; patrimônio é opcional e, se vazio, cai para `TI-—`. O item entra no topo da lista do catálogo.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Cadastrar equipamento: nome (obrigatório), patrimônio (opcional, padrão `TI-—`), descrição, tipo/categoria, status inicial (disponível / manutenção). |
| CA-02 | Se o nome não for informado, retorna erro de validação (toast "Informe o nome do equipamento" no front; 400 RFC 9457 no back). |
| CA-03 | Patrimônio vazio é armazenado como `TI-—`. |
| CA-04 | O item recém-cadastrado entra no topo da lista do catálogo (ordenado por data de criação desc). |
| CA-05 | Isolamento por tenant: equipamento cadastrado no tenant A só é visível dentro do tenant A. |
| CA-06 | Autorização por role: apenas usuários com role de operação/admin no tenant podem cadastrar equipamentos. |
| CA-07 | Endpoint `POST /v1/equipamentos` retorna RFC 9457 (Problem Details) em caso de erro. |

## Requisitos não funcionais
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT via guard — nunca do corpo/query.
- **Autorização:** CASL — regras por role **e** por tenant (ADR-001).
- **Validação:** Zod via nestjs-zod (ADR-001).

## Fora de escopo
- Edição de equipamentos (pode ser future spec).
- Importação de planilha (espec 007).
- Reserva com data futura (espec 005).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".