import { Controller, Get, Header } from '@nestjs/common';

/**
 * Pagina raiz da API.
 *
 * A API e versionada por prefixo ("/v1" em main.ts, ADR-001 §4). Esta rota e a
 * unica excecao: ela fica na raiz "/" e devolve um texto simples.
 * A excecao e declarada em main.ts via `setGlobalPrefix('v1', { exclude })`.
 */
@Controller()
export class RootController {
  /** Texto simples "Hello World", exibido na tela padrao do navegador. */
  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  index(): string {
    return 'Hello World';
  }
}