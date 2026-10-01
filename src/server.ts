/**
 * Compatibilidade: o entrypoint agora e `src/main.ts` (padrao do NestJS,
 * reconhecido pela deteccao zero-config da Vercel). Este arquivo apenas
 * delega para `main.ts` para nao quebrar referencias antigas a `server.ts`.
 */
export {};
import './main';
