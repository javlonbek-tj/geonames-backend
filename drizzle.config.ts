import { defineConfig } from 'drizzle-kit';
import { ENV } from './src/config/env';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: ENV.DATABASE_URL!,
  },
});
