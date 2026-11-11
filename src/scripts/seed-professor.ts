import { runUserSeed } from './seed-support';

runUserSeed(
  'marcelo.grilo@institutojef.org.br',
  process.env.INITIAL_PROFESSOR_PASSWORD,
  'Marcelo Grilo',
  'admin',
).catch((error: unknown) => {
  console.error('[seed:professor] failed:', error instanceof Error ? error.message : 'Unknown error.');
  process.exitCode = 1;
});
