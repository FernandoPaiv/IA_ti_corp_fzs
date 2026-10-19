import { Injectable } from '@nestjs/common';
import { DemoRepository, DemoStats } from './demo.repository';

/**
 * Camada de servico da tela de demonstracao. Por ser so uma leitura de demo,
 * delega direto ao repository (sem regra de negocio por enquanto).
 */
@Injectable()
export class DemoService {
  constructor(private readonly repository: DemoRepository) {}

  stats(): Promise<DemoStats> {
    return this.repository.stats();
  }
}
