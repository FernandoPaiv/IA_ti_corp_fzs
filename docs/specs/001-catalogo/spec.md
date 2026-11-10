---
description: Catálogo de equipamentos de TI disponíveis para empréstimo.
alwaysApply: false
---

# Spec 001 — Catálogo de equipamentos

> Leitor: agente  
> Fonte de requisitos: `layout.md` §7 (catálogo), §9 (dados de exemplo), `AGENTS.md` (multi-tenancy, ADR-001).

## Contexto
O catálogo é a vitrine pública (dentro do tenant) dos equipamentos de TI disponíveis para empréstimo. Qualquer usuário autenticado no tenant pode navegar pelo catálogo, buscar e filtrar equipamentos, mas só vê os próprios empréstimos na tela "Meus empréstimos".

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Listar equipamentos do tenant com paginação cursor-based (primeira página sem cursor, páginas seguintes com `cursor` retornado na resposta anterior). |
| CA-02 | Cada item do catálogo exibe: nome do equipamento, patrimônio (ex.: `TI-0142`), status (disponível / emprestado / manutenção), foto/ícone do tipo de equipamento e, se emprestado, quem tem e até quando. |
| CA-03 | Busca por nome ou patrimônio, case-insensitive, com filtragem imediata a cada tecla. |
| CA-04 | Filtros de situação exclusivos: Todos / Disponíveis / Emprestados / Em manutenção. Ativo ganha borda e texto no acento (teal) e fundo `rgba(47,184,172,0.10)`. |
| CA-05 | Se não houver resultado para a busca/filtro, exibe estado vazio próprio (mensagem "Nenhum equipamento encontrado"). |
| CA-06 | Isolamento por tenant: usuário do tenant A nunca vê equipamentos do tenant B. |
| CA-07 | Endpoint `GET /v1/equipamentos` retorna RFC 9457 (Problem Details) em caso de erro. |

## Requisitos não funcionais
- **Paginação:** cursor-based (não offset), conforme ADR-001.
- **Erro:** RFC 9457 (Problem Details), conforme ADR-001.
- **Multi-tenancy:** `tenant_id` resolvido do JWT claim via guard, nunca do corpo/query da requisição.
- **Banco:** Postgres via Prisma, `tenant_id` em toda tabela de domínio.
- **Performance:** listagem inicial deve caber no teto de 60s da Vercel (batches, se necessário).

## Fora de escopo
- Reserva com data futura (espec 005).
- Cadastro/edição de equipamentos (espec 004).
- Importação de planilha (espec 007).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".