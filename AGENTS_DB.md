---
description: Procedimento para qualquer mudança de schema (Prisma Migrate + Supabase)
globs: ["prisma/migrations/**", "prisma/schema.prisma", "src/modules/**"]
alwaysApply: false
---

# Mudança de schema
> lector: agente

## Cuando
Qualquier tarea que necesite crear, modificar o eliminar tabla, columna,
índice, constraint o policy — incluso cuando el cambio parezca trivial.
Todo el schema vive en `prisma/schema.prisma` y en las migrations de Prisma.

## Stack de datos (del ADR-001 §5)
- Base: PostgreSQL gestionado por Supabase.
- ORM: Prisma.
- **Dueño único del schema: Prisma Migrate.** Supabase CLI no es un segundo
  dueño — dos dueños se sobrescriben y el ambiente diverge de producción.
- Objetos que Prisma no modela (RLS, policies, triggers): SQL crudo dentro
  de las propias migrations de Prisma, nunca como script suelto.
- Seed: `prisma/seed.ts`, idempotente, crea el tenant `suporte_ti`.

## Conexiones (dos endpoints)
- **Runtime**: Supavisor (pooler), puerto 6543, `?pgbouncer=true&connection_limit=1`.
- **Migración**: `directUrl`, puerto 5432. El pooler en transaction mode no
  soporta los comandos que la migration usa.

## Procedimiento
1. Antes de generar nada: escribe el DDL / cambio de schema propuesto en la
   respuesta y DETENTE. Yo apruebo o corrijo.
2. Si la mudança es modelable por Prisma (tabla, columna, índice, constraint,
   relación): edita `prisma/schema.prisma` y genera la migration con
   `npx prisma migrate dev --name <nombre>`. Una migration por tarea.
3. Si la mudança requiere RLS, policies o triggers (que Prisma no modela):
   escribe el SQL crudo dentro de la misma migration generada, en su propia
   `migration.sql`, versionado en la misma línea de tiempo del schema.
4. **Toda tabla nueva nace con Row Level Security habilitada y al menos una
   policy explícita en la misma migration.** Tabla sin policy no entra al
   repositorio. En tablas de dominio, `tenant_id` presente en TODAS — una
   tabla sin la columna es el hueco por donde se filtra el dato entre tenants.
5. Columna obligatoria nueva: necesita default o un paso de pre-relleno.
   Si la tabla ya tiene datos, indica qué pasa con las filas existentes.
6. Aplica en local con `npx prisma migrate reset` (o `migrate dev`) y ejecuta
   los tests. En producción/CI se aplica con `prisma migrate deploy` en un
   job de GitHub Actions **antes** del deploy (no en el boot, porque las
   instancias serverless arrancan en paralelo).

## Verificación
`npx prisma migrate reset && npx prisma migrate deploy` en una máquina limpia
aplica todas las migrations desde cero, sin error y sin ningún paso manual.
El test del Repository corre contra Postgres real (Testcontainers), no un mock.

## No hagas
- No alteres el schema por el Studio ni por SQL suelto. Lo que no está en la
  migration no existe.
- No edites una migration que ya fue enviada al repositorio remoto. Escribe
  la siguiente.
- No toques el proyecto Supabase remoto por fuera de las migrations/CI. Todo
  ocurre en local.
- No uses Supabase CLI como dueño del schema.
- No omitas el test de aislamiento por tenant por cada endpoint afectado.