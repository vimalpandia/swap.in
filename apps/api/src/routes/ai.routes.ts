import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { aiCaptionRequestSchema, aiSmartReplyRequestSchema } from '@swap/shared';

const router = Router();

router.post('/caption', authenticate, validateBody(aiCaptionRequestSchema), aiController.generateCaption);
router.post('/smart-reply', authenticate, validateBody(aiSmartReplyRequestSchema), aiController.generateSmartReplies);

export default router;
