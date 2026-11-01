import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './env';
import { logger } from './logger';

let redisClient: Redis;

try {
  if (config.isTest) {
    redisClient = new RedisMock() as unknown as Redis;
    logger.info('Using in-memory RedisMock for test environment');
  } else {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis unavailable after 3 attempts. Switching to in-memory fallback.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.connect().catch(() => {
      logger.warn('Failed to connect to real Redis, falling back to in-memory mock');
      redisClient = new RedisMock() as unknown as Redis;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });
  }
} catch (err: any) {
  logger.warn(`Redis initialization exception: ${err.message}. Using mock.`);
  redisClient = new RedisMock() as unknown as Redis;
}

export { redisClient };

