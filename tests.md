# Testes — padrão do projeto

> Regra de origem: [`rules/tests.md`](rules/tests.md). Este arquivo é a versão
> concreta para o backend (`IA_ti_corp_tb`), com os comandos reais no lugar dos
> placeholders (`<COMANDO-TESTES>`).

## Quando

Ao escrever, alterar ou remover qualquer teste.

## Stack de teste (ADR-001 §8)

| Camada            | Ferramenta                          |
| ----------------- | ----------------------------------- |
| Unit (service)    | Jest                                |
| Integração (DB)   | Jest + Testcontainers (Postgres real) |
| API (endpoint)    | Jest + supertest sobre o app Nest   |

- Não existe meta de cobertura. Caminho crítico é o critério.
- Repository/Service **não** é testado contra mock de banco: sobe Postgres real
  (Testcontainers). Testar mock não exercita constraint, transação nem policy.

## Procedimento

1. **Banco local, nunca o remoto.** Os testes rodam contra Postgres real
   local/efêmero (Testcontainers) apontando para `DATABASE_URL` local. Nunca
   contra o projeto Supabase remoto.
2. **O nome do teste cita o critério que ele prova:** `test_ca_03_...`
   (`ca` = critério de aceitação; `03` = número do CA no `docs/specs/`).
   Exemplo: `test_ca_03_lista_de_ativos_nao_retorna_item_de_outro_tenant`.
3. **Teste de endpoint verifica status E corpo.** Não basta `expect(res.status)`;
   o assertion do body é obrigatório (o `status 200` com payload errado passa
   despercebido).
4. **Toda tabela com política de acesso tem um teste que prova o bloqueio:**
   o mesmo dado, com outro usuário/tenant, não retorna (isolamento por tenant).
5. **Todo endpoint tocado por tenant tem seu teste de isolamento** — tenant A
   não vê dado do tenant B. Sem esse teste a tarefa não está pronta
   (é obrigatório por endpoint, ADR-001 §8).

## Verificação

```bash
# Reset do schema local (Prisma Migrate é o dono único) + testes + build.
npx prisma migrate reset --force && npm test && npm run build
```

`npm test` (`jest --runInBand`) passa com o banco local recém-resetado, e
`npm run build` (`tsc -p tsconfig.json`) termina sem erro. As duas coisas.

## Não faça

- Não rode teste contra o banco Supabase remoto.
- Não mocke o banco nos testes de repository/integração.
- Não declare pronto com teste vermelho, mesmo que o código "esteja certo".
