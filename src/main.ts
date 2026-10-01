import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

/**
 * Entrypoint principal (padrão do NestJS) — ADR-001 §3.
 *
 * A Vercel usa a detecção zero-config de NestJS: o nome `src/main.ts` é o
 * entrypoint padrão gerado por `nest new` e por isso é o mais reconhecido
 * pela plataforma. Ela cria a Function a partir do `app.listen()` abaixo.
 *
 * O fluxo serverless antigo (ExpressAdapter/@vendia/serverless-express) foi
 * abandonado: sem ele, a Vercel passa a tratar o projeto como NestJS (e não
 * como site estático), evitando o erro "No Output Directory named public".
 *
 * Referência: https://vercel.com/docs/frameworks/backend/nestjs
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS por allowlist do front (ADR-001 §7). FRONTEND_ORIGIN aceita uma ou
  // mais origens separadas por virgula (producao + preview do front).
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Versionamento por prefixo de rota (ADR-001 §4).
  app.setGlobalPrefix('v1');

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
