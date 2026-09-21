import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DbService {
  /**
   * Faz uma consulta inocua (só leitura) contra o banco Supabase
   * a partir de DATABASE_URL, e devolve o estado da conexión.
   */
  async ping(): Promise<{ status: string; db: string; time?: string; error?: string }> {
    const connString = process.env.DATABASE_URL;

    if (!connString) {
      return { status: 'error', db: 'missing DATABASE_URL in env' };
    }

    let client: Client | undefined;
    try {
      client = new Client({ connectionString: connString, ssl: { rejectUnauthorized: false } });
      await client.connect();
      const { rows } = await client.query<{ now: string }>('SELECT NOW() AS now');
      const time = rows[0]?.now;
      return { status: 'ok', db: 'supabase', time };
    } catch (err) {
      return { status: 'error', db: 'supabase', error: String(err) };
    } finally {
      if (client) {
        await client.end();
      }
    }
  }
}