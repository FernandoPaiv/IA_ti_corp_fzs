---
description: O que precisa passar antes de declarar uma tarefa pronta
globs: []
alwaysApply: true
---

# Verificação de fim de tarefa
> lector: agente

## Quando
Sempre que você for dizer "pronto", "implementado" ou "funcionando".

## Procedimento
1. Rode o pipeline de testes do lado afetado e cole a última linha da saída
   na resposta:
   - Backend: `npm test` (Jest + supertest + Testcontainers).
   - Frontend: testes unit (Vitest) e E2E (Playwright).
2. Se a tarefa tocou em migration, rode `npx prisma migrate reset` local e
   confirme que o banco sobe do zero com todas as migrations. O seed
   idempotente tem que criar o tenant `suporte_ti`.
3. Rode o build antes de qualquer push. Build que quebra na Vercel é o
   feedback mais lento e mais caro deste projeto.
4. Todo endpoint tocado por tenant tem que ter seu teste de isolamento:
   tenant A não vê dado de tenant B. Sem esse teste, a tarefa não está
   pronta.
5. Rode `git status --short`. Só podem aparecer arquivos do escopo
   da tarefa.

## Verificação
Pronto = os comandos terminaram sem falha E o git status não trouxe
surpresa. As duas coisas, não uma.

## Não faça
- Não relate sucesso parcial. Teste vermelho é tarefa não terminada,
  mesmo que o código "esteja certo".
- Não tente consertar a mesma falha duas vezes seguidas sem me mostrar
  a saída do erro.
- Não rode teste contra o banco remoto. Use Postgres real local
  (Testcontainers), não um mock.