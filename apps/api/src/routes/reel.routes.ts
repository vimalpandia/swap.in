import { Router } from 'express';
import { reelController } from '../controllers/reel.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createReelSchema, logWatchTimeSchema } from '@swap/shared';

const router = Router();

router.get('/', optionalAuthenticate, reelController.getFeed);
router.post('/', authenticate, validateBody(createReelSchema), reelController.createReel);
router.post('/watch-time', authenticate, validateBody(logWatchTimeSchema), reelController.logWatchTime);
router.post('/:id/like', authenticate, reelController.toggleLike);
router.post('/:id/save', authenticate, reelController.toggleSave);
router.post('/:id/collab/respond', authenticate, reelController.respondToCollab);

export default router;
