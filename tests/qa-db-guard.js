const rawUrl = process.env.QA_DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    'Tests require QA_DATABASE_URL for the local qa_test database; remote .env URLs are refused.',
  );
}

let databaseUrl;
try {
  databaseUrl = new URL(rawUrl);
} catch {
  throw new Error('QA_DATABASE_URL must be a valid PostgreSQL URL.');
}

const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

if (
  !['postgres:', 'postgresql:'].includes(databaseUrl.protocol) ||
  !localHosts.has(databaseUrl.hostname.toLowerCase()) ||
  databaseUrl.port !== '55432' ||
  databaseName !== 'qa_test'
) {
  throw new Error(
    'Tests are restricted to PostgreSQL at 127.0.0.1:55432/qa_test.',
  );
}

process.env.DATABASE_URL = rawUrl;
process.env.DIRECT_URL = rawUrl;
