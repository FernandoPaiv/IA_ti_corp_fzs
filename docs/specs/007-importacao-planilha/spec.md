---
description: Importação de equipamentos via planilha.
alwaysApply: false
---

# Spec 007 — Importação de planilha

> Leitor: agente  
> Fonte de requisitos: `layout.md` §7 (fora da v1: importação de planilha).

## Contexto
Funcionalidade fora da v1. Permite importar múltiplos equipamentos de uma vez via planilha (CSV ou XLSX), mapeando colunas para os campos do modelo de equipamento.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| CA-01 | Upload de planilha (CSV ou XLSX) com equipamentos para importação. |
| CA-02 | Mapeamento de colunas: nome, patrimônio, descrição, tipo/categoria, status. |
| CA-03 | Nome é obrigatório por linha; linha sem nome é rejeitada com erro detalhado. |
| CA-04 | Patrimônio vazio cai para `TI-—` por linha. |
| CA-05 | Isolamento por tenant: equipamentos importados ficam vinculados ao tenant do usuário logado. |
| CA-06 | Autorização por role: apenas usuários com role de operação/admin no tenant podem importar. |
| CA-07 | Endpoint `POST /v1/equipamentos/importar` retorna RFC 9457 (Problem Details) em caso de erro. |
| CA-08 | Execução em lotes que caibam no teto de 60s da Vercel (se a planilha for grande, processar em batches). |

## Requisitos não funcionais
- **Erro:** RFC 9457 (ADR-001).
- **Multi-tenancy:** `tenant_id` do JWT via guard — nunca do corpo/query.
- **Autorização:** CASL — regras por role **e** por tenant (ADR-001).
- **Validação:** Zod via nestjs-zod (ADR-001).
- **Execução:** sem fila (ADR-001) — processamento síncrono na request, em lotes que caibam em 60s.

## Fora de escopo
- Exportação de planilha (future spec).
- Importação de usuários ou empréstimos (apenas equipamentos).

## Antes de declarar pronta
- Delegar ao subagente `verificador-spec` com o caminho da spec e o intervalo de commits.
- A spec só está pronta com "Veredito: PRONTA".