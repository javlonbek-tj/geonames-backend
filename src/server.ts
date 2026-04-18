import http from 'http';
import { ENV } from './config';

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

import app from './app';
import { connectDb } from './db/db';
import { startBot } from './modules/telegram-bot/bot';

let server: http.Server;

async function start(): Promise<void> {
  await connectDb();

  startBot();

  server = app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
  });
}

start();

process.on('unhandledRejection', (reason: unknown) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(
    reason instanceof Error ? `${reason.name}: ${reason.message}` : reason,
  );
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED! 💥 Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
