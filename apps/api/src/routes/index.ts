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

// Health check
router.get('/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Swap Social API',
    tagline: 'Swap moments. Swap vibes.',
    database: isDbConnected ? 'connected' : 'connecting_or_standalone',
    uptime: Math.round(process.uptime()),
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
