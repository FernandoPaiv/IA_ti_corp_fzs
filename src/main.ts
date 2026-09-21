import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versionamento por prefixo de rota (ADR-001 §4).
  app.setGlobalPrefix('v1');

  // CORS com allowlist da origem do front (ADR-001 §7).
  // FRONTEND_ORIGIN e a URL do projeto front na Vercel.
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  app.use(
    cors({
      origin: frontendOrigin ?? true,
      credentials: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API ouvindo na porta ${port}`);
}

bootstrap();