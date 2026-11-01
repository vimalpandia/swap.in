import { Router } from 'express';
import { swapController } from '../controllers/swap.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createSwapChallengeSchema,
  replySwapChallengeSchema,
  swapDayNoteSchema,
} from '@swap/shared';

const router = Router();

// Swap Challenges
router.post(
  '/challenge',
  authenticate,
  validateBody(createSwapChallengeSchema),
  swapController.createChallenge
);
router.post(
  '/challenge/:challengeId/reply',
  authenticate,
  validateBody(replySwapChallengeSchema),
  swapController.replyChallenge
);
router.get('/challenges', authenticate, swapController.getUserChallenges);
router.get('/duets', optionalAuthenticate, swapController.getDuetsFeed);

// Swap Day
router.get('/day', authenticate, swapController.getSwapDayMatch);
router.post(
  '/day/:matchId/vibe-note',
  authenticate,
  validateBody(swapDayNoteSchema),
  swapController.saveSwapDayVibeNote
);

export default router;

