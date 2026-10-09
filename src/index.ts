import './config/env'; // validate env first
import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { connectRabbitMQ, disconnectRabbitMQ } from './config/rabbitmq';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  await connectRabbitMQ();

  const server = app.listen(env.PORT, () => {
    console.log(`VoyageMatrix API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      await disconnectRabbitMQ();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
