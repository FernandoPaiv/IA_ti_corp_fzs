import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

/**
 * Entrypoint da Vercel (ADR-001 §3).
 *
 * A Vercel detecta NestJS sem configuracao extra quando o arquivo se chama
 * `src/server.{ts,js}` (ou `main`/`app`/`index`, na raiz ou em `src/`). O
 * `app.listen()` abaixo e a propria chamada que a plataforma usa para criar a
 * function — nao ha handler manual nem adapter serverless.
 *
 * Referencia: https://vercel.com/docs/frameworks/backend/nestjs
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // A Vercel roteia tudo para este mesmo servidor; validamos a origem do front
  // por CORS (allowlist), conforme ADR-001 §7.
  // FRONTEND_ORIGIN aceita uma ou mais origens separadas por virgula (ex.: a
  // URL de producao e a de preview/branch do front).
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
