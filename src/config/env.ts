function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const ENV = {
  PORT: Number(requireEnv('PORT')),
  NODE_ENV: requireEnv('NODE_ENV'),
  FRONTEND_URL: requireEnv('FRONTEND_URL'),
  PUBLIC_FRONTEND_URL: requireEnv('PUBLIC_FRONTEND_URL'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  TELEGRAM_BOT_TOKEN: requireEnv('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_BOT_USERNAME: requireEnv('TELEGRAM_BOT_USERNAME'),
  JWT_CITIZEN_SECRET: requireEnv('JWT_CITIZEN_SECRET'),
};
