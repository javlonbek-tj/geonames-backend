import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV } from '../config/env';
import * as schema from './schema';

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl:
    ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// log when first connection is made
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// log when an error occurs
pool.on('error', (err) => {
  console.log('❌ Database connection error:', err);
});

export const db = drizzle({ client: pool, schema });

export async function connectDb(): Promise<void> {
  const client = await pool.connect();
  client.release();
}
