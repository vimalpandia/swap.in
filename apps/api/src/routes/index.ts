import mongoose from 'mongoose';
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import reelRoutes from './reel.routes';
import storyRoutes from './story.routes';
import commentRoutes from './comment.routes';
import capsuleRoutes from './capsule.routes';
import wasteTimeRoutes from './wasteTime.routes';
import streakRoutes from './streak.routes';
import chatRoutes from './chat.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';
import swapRoutes from './swap.routes';
import uploadRoutes from './upload.routes';
import { sendSuccess } from '../utils/response';

const router = Router();

// Safe database & API health check
router.get('/health', async (_req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  let isPingOk = false;
  let dbLatencyMs: number | null = null;

  if (dbReadyState === 1 && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - start;
      isPingOk = true;
    } catch {
      isPingOk = false;
    }
  }

  const isHealthy = dbReadyState === 1 && isPingOk;

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'Swap Social API',
      tagline: 'Swap moments. Swap vibes.',
      database: {
        status: dbReadyState === 1 ? 'connected' : 'disconnected',
        connected: dbReadyState === 1,
        ping: isPingOk ? 'pong' : 'failed',
        latencyMs: dbLatencyMs,
      },
      uptime: Math.round(process.uptime()),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/reels', reelRoutes);
router.use('/stories', storyRoutes);
router.use('/comments', commentRoutes);
router.use('/capsules', capsuleRoutes);
router.use('/waste-time', wasteTimeRoutes);
router.use('/streaks', streakRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/swap', swapRoutes);
router.use('/upload', uploadRoutes);

export default router;
