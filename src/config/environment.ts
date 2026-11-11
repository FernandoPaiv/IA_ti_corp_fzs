export interface RuntimeEnvironment {
  databaseUrl: string;
  supabaseUrl: URL;
  supabaseAnonKey: string;
  frontendOrigins: string[];
  jwksUri: string;
  port: number;
}

function readWebUrl(value: string, name: string, allowLoopback: boolean): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }

  const loopback = allowLoopback && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:')) {
    throw new Error(`${name} must use HTTPS except for localhost development.`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must not contain credentials, query parameters, or a fragment.`);
  }
  return url;
}

export function validateEnvironment(env: NodeJS.ProcessEnv = process.env): RuntimeEnvironment {
  const missing = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FRONTEND_ORIGIN']
    .filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}.`);
  }

  const databaseUrl = env.DATABASE_URL!.trim();
  let parsedDatabaseUrl: URL;
  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (
    !['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol) ||
    !parsedDatabaseUrl.hostname ||
    parsedDatabaseUrl.pathname === '/'
  ) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL with a host and database name.');
  }

  const supabaseUrl = readWebUrl(env.SUPABASE_URL!.trim(), 'SUPABASE_URL', true);
  if (supabaseUrl.pathname !== '/' || supabaseUrl.search || supabaseUrl.hash) {
    throw new Error('SUPABASE_URL must be the project origin without a path or query.');
  }

  const frontendOrigins = env.FRONTEND_ORIGIN!.split(',').map((value) => value.trim());
  if (frontendOrigins.some((origin) => !origin)) {
    throw new Error('FRONTEND_ORIGIN must contain only non-empty comma-separated origins.');
  }
  for (const origin of frontendOrigins) {
    const parsedOrigin = readWebUrl(origin, 'FRONTEND_ORIGIN', true);
    if (parsedOrigin.origin !== origin.replace(/\/$/, '')) {
      throw new Error('Each FRONTEND_ORIGIN entry must contain only an origin.');
    }
  }

  const jwksUri = env.JWKS_URI?.trim() ||
    new URL('/auth/v1/.well-known/jwks.json', supabaseUrl).toString();
  const parsedJwksUri = readWebUrl(jwksUri, 'JWKS_URI', true);
  if (
    parsedJwksUri.origin !== supabaseUrl.origin ||
    parsedJwksUri.pathname !== '/auth/v1/.well-known/jwks.json'
  ) {
    throw new Error('JWKS_URI must be the standard Supabase Auth JWKS endpoint on SUPABASE_URL.');
  }

  const rawPort = env.PORT?.trim() || '3000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return {
    databaseUrl,
    supabaseUrl,
    supabaseAnonKey: env.SUPABASE_ANON_KEY!.trim(),
    frontendOrigins: frontendOrigins.map((origin) => new URL(origin).origin),
    jwksUri: parsedJwksUri.toString(),
    port,
  };
}
