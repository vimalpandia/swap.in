import { Queue } from 'bullmq';
import { config } from '../config/env';
import { logger } from '../config/logger';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export let videoProcessingQueue: Queue | null = null;
export let storyCleanupQueue: Queue | null = null;
export let notificationFanoutQueue: Queue | null = null;

try {
  videoProcessingQueue = new Queue('video-processing', { connection });
  storyCleanupQueue = new Queue('story-cleanup', { connection });
  notificationFanoutQueue = new Queue('notification-fanout', { connection });
  logger.info('BullMQ queues initialized successfully');
} catch (err: any) {
  logger.warn(`BullMQ queue initialization skipped: ${err.message}`);
}

