import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cors from 'cors';
import express from 'express';
import { AppModule } from './app.module';
import 'dotenv/config';

/**
 * Entrypoint serverless da Vercel (ADR-001 §3).
 *
 * A Vercel procura por `server.{ts,js}` na raiz ou em `src/` e exige que
 * `server.listen()` seja chamado no carregamento do modulo. A instancia do
 * Express e do Nest e criada UMA vez e cacheada fora do handler: sem isso,
 * cada request pagaria o bootstrap do container de DI.
 */

const server = express();

// A Vercel roteia tudo para este mesmo servidor; validamos a origem do front
// por CORS (allowlist), conforme ADR-001 §7.
const frontendOrigin = process.env.FRONTEND_ORIGIN;
server.use(
  cors({
    origin: frontendOrigin ?? true,
    credentials: true,
  }),
);

let cachedApp: Promise<void> | undefined;

async function createApp(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Versionamento por prefixo de rota (ADR-001 §4).
  app.setGlobalPrefix('v1');

  await app.init();
}

// Instancia cacheada: sobrevive entre chamadas na mesma instancia da function.
function bootstrap(): Promise<void> {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

// A Vercel detecta o HTTP server por esta chamada.
server.listen(process.env.PORT ?? 3000, () => {
  bootstrap().catch((err) => {
    console.error('Falha ao inicializar a aplicacao Nest', err);
  });
});
