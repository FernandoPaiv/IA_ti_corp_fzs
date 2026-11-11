import { runUserSeed } from './seed-support';

const email = process.env.QA_USER_EMAIL?.trim();
if (email?.toLowerCase() === 'marcelo.grilo@institutojef.org.br') {
  console.error('[seed:qa-user] QA_USER_EMAIL must be separate from the professor account.');
  process.exitCode = 1;
} else {
  runUserSeed(
    email ?? '',
    process.env.QA_USER_PASSWORD,
    process.env.QA_USER_FULL_NAME?.trim() || 'Usuário QA',
    'colaborador',
  ).catch((error: unknown) => {
    console.error('[seed:qa-user] failed:', error instanceof Error ? error.message : 'Unknown error.');
    process.exitCode = 1;
  });
}
