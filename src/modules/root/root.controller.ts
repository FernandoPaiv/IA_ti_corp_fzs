import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Pagina raiz da API.
 *
 * A API e versionada por prefixo ("/v1" em main.ts, ADR-001 §4). Esta rota e a
 * unica excecao: ela fica na raiz "/" para servir uma landing page simples.
 * A excecao e declarada em main.ts via `setGlobalPrefix('v1', { exclude })`.
 */
@Controller()
export class RootController {
  /**
   * Landing page em HTML.
   *
   * Retorna 200 com uma pagina HTML basica (Hello World) e um link para a
   * documentacao da API versionada.
   */
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  index(@Res() res: Response): void {
    res.status(200).send(
      `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EMPREST.AI - API</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0d1117;
        color: #e6edf3;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
      main { text-align: center; padding: 2rem; }
      h1 { font-size: clamp(2rem, 6vw, 3rem); margin: 0 0 0.5rem; letter-spacing: -0.02em; }
      p { margin: 0 0 1.5rem; color: #8b949e; }
      a {
        display: inline-block;
        padding: 0.6rem 1.2rem;
        border: 1px solid #30363d;
        border-radius: 8px;
        color: #e6edf3;
        text-decoration: none;
        font-size: 0.9rem;
      }
      a:hover { border-color: #58a6ff; color: #58a6ff; }
    </style>
  </head>
  <body>
    <main>
      <h1>Hello World</h1>
      <p>EMPREST.AI - API de emprestimos de equipamentos de TI</p>
      <a href="/v1/health">/v1/health</a>
    </main>
  </body>
</html>`,
    );
  }
}