import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { updateProfileSchema, vibeSchema } from '@swap/shared';

const router = Router();

router.get('/search', optionalAuthenticate, userController.search);
router.get('/:username', optionalAuthenticate, userController.getProfile);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), userController.updateProfile);
router.put('/vibe', authenticate, userController.updateVibe);
router.post('/vibe', authenticate, userController.updateVibe);
router.post('/:userId/follow', authenticate, userController.follow);
router.delete('/:userId/follow', authenticate, userController.unfollow);

export default router;
