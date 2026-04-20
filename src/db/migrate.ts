import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV } from '../config/env';

async function main() {
  const pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    ssl: ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  const db = drizzle({ client: pool });

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');

  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
