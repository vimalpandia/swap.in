import { Router } from 'express';
import { storyController } from '../controllers/story.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createStorySchema } from '@swap/shared';

const router = Router();

router.get('/tray', optionalAuthenticate, storyController.getTray);
router.post('/', authenticate, validateBody(createStorySchema), storyController.createStory);
router.post('/:id/view', authenticate, storyController.recordView);
router.get('/:id/viewers', authenticate, storyController.getViewers);

export default router;
