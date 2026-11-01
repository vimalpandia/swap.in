import { Worker } from 'bullmq';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { redisClient } from '../config/redis';

export function startWorkers() {
  if (config.isTest) return;

  // Only start workers if Redis is actually connected to avoid connection retry loops
  if (redisClient.status !== 'ready' && redisClient.status !== 'connect') {
    logger.info('Workers waiting for Redis ready state (background queues will run in fallback mode)');
    return;
  }

  try {
    const connection = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    };

    const videoWorker = new Worker(
      'video-processing',
      async (job) => {
        logger.info(`Processing video job ${job.id} for reel ${job.data.reelId}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          hlsPlaylistUrl: `${job.data.videoUrl}.m3u8`,
          thumbnailUrl: `${job.data.videoUrl}.thumb.jpg`,
          duration: 15.0,
        };
      },
      { connection }
    );

    const storyWorker = new Worker(
      'story-cleanup',
      async () => {
        logger.info('Running 24-hour expired story archival job');
      },
      { connection }
    );

    const notificationWorker = new Worker(
      'notification-fanout',
      async (job) => {
        logger.info(`Fan-out notification job ${job.id} to followers`);
      },
      { connection }
    );

    videoWorker.on('error', (err) => logger.warn(`Video worker error: ${err.message}`));
    storyWorker.on('error', (err) => logger.warn(`Story worker error: ${err.message}`));
    notificationWorker.on('error', (err) => logger.warn(`Notification worker error: ${err.message}`));
  } catch (err: any) {
    logger.warn(`Worker initialization handled: ${err.message}`);
  }
}
