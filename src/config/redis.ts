import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  console.log('Redis disconnected');
}

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}
