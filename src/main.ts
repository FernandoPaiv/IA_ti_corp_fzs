import 'reflect-metadata';
import 'dotenv/config';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './http/problem-details.filter';
import { validateEnvironment } from './config/environment';

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
  const config = validateEnvironment();
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ProblemDetailsFilter());

  // CORS por allowlist do front (ADR-001 §7). FRONTEND_ORIGIN aceita uma ou
  // mais origens separadas por virgula (producao + preview do front).
  app.enableCors({
    origin: config.frontendOrigins,
    credentials: true,
  });

  // Versionamento por prefixo de rota (ADR-001 §4).
  // A raiz "/" e a unica excecao: serve a landing page "Hello World".
  app.setGlobalPrefix('v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  await app.listen(config.port);
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error.';
  console.error(`[startup] ${message}`);
  process.exitCode = 1;
});
