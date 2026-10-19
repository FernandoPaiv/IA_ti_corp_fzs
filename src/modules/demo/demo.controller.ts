import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service';
import { DemoStats } from './demo.repository';

/**
 * Tela de demonstracao: expoe contagens reais do banco para "ver que funciona".
 * Prefixo global "/v1" definido em main.ts (ADR-001 §4).
 */
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  /** GET /v1/demo/stats — contagens por tabela (somente leitura). */
  @Get('stats')
  stats(): Promise<DemoStats> {
    return this.demoService.stats();
  }
}
