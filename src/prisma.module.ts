import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Provedor global do PrismaClient (padrao Prisma + Nest).
 * `@Global()` evita importar o modulo em todos os outros.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
