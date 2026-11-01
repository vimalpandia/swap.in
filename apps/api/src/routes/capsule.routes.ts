import { Router } from 'express';
import { capsuleController } from '../controllers/capsule.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createTimeCapsuleSchema } from '@swap/shared';

const router = Router();

router.get('/', authenticate, capsuleController.getCapsules);
router.post('/', authenticate, validateBody(createTimeCapsuleSchema), capsuleController.createCapsule);

export default router;
