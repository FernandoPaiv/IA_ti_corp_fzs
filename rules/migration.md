---
description: Procedimento para qualquer mudança de schema (Prisma Migrate + Supabase)
globs: ["prisma/migrations/**", "prisma/schema.prisma", "src/modules/**"]
alwaysApply: false
---

# Mudança de schema
> lector: agente

## Quando
Qualquier tarea que necesite crear, modificar o eliminar tabla, columna,
índice, constraint o policy — incluso cuando el cambio parezca trivial.
Todo el schema vive en `prisma/schema.prisma` y en las migrations de Prisma.

## Stack de datos (ADR-001 §5)
- Base: PostgreSQL gestionado por Supabase. ORM: Prisma.
- **Dueño único del schema: Prisma Migrate.** Supabase CLI no es segundo dueño.
- Objetos que Prisma no modela (RLS, policies, triggers): SQL crudo dentro de
  la propia migration, nunca como script suelto.
- Seed: `prisma/seed.ts`, idempotente, crea el tenant `suporte_ti`.

## Conexiones
- Runtime: Supavisor (pooler), puerto 6543, `?pgbouncer=true&connection_limit=1`.
- Migración: `directUrl`, puerto 5432. El pooler no soporta comandos de migration.

## Procedimiento
1. Antes de generar nada: escribe el DDL / cambio de schema en la respuesta
   y DETENTE. Yo apruebo o corrijo.
2. Si es modelable por Prisma: edita `prisma/schema.prisma` y genera con
   `npx prisma migrate dev --name <nombre>`. Una migration por tarea.
3. Si requiere RLS/policies/triggers: SQL crudo dentro de la misma migration
   generada (`migration.sql`), versionado con el schema.
4. **Toda tabla nueva nace con Row Level Security habilitada y al menos una
   policy explícita en la misma migration.** Toda tabla de dominio lleva
   `tenant_id` — tabla sin la columna es el hueco de fuga entre tenants.
5. Columna obligatoria nueva: necesita default o relleno. Si la tabla ya
   tiene datos, indica qué pasa con las filas existentes.
6. Aplica en local con `npx prisma migrate reset` y roda testes. En CI se
   aplica con `prisma migrate deploy` en un job de GitHub Actions **antes**
   del deploy (no en boot).

## Verificación
`npx prisma migrate reset && npx prisma migrate deploy` em uma máquina limpa
aplica todas as migrations do zero, sem erro e sem nenhum passo manual.

## Não faça
- Não altere schema pelo Studio nem por SQL avulso. O que não está em
  migration não existe.
- Não edite migration que já foi enviada ao repositório remoto. Escreva
  a próxima.
- Não toque no projeto Supabase remoto. Tudo acontece no local.