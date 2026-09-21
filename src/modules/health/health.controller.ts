import { Controller, Get } from '@nestjs/common';
import { DbService } from './db.service';

/**
 * Rotas de teste (health check).
 * Prefixo global "/v1" definido em main.ts (ADR-001 §4).
 */
@Controller('health')
export class HealthController {
  constructor(private readonly dbService: DbService) {}

  /** Testa se a API esta no ar, sem tocar no banco. */
  @Get()
  alive(): { status: string } {
    return { status: 'ok' };
  }

  /** Testa a conexao real com o banco Supabase (SELECT NOW()). */
  @Get('db')
  db(): Promise<{ status: string; db: string; time?: string; error?: string }> {
    return this.dbService.ping();
  }
}
