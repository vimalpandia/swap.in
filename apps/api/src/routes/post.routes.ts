import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createPostSchema } from '@swap/shared';

const router = Router();

router.get('/', optionalAuthenticate, postController.getFeed);
router.post('/', authenticate, validateBody(createPostSchema), postController.createPost);
router.get('/:id', optionalAuthenticate, postController.getById);
router.post('/:id/like', authenticate, postController.toggleLike);
router.post('/:id/save', authenticate, postController.toggleSave);
router.delete('/:id', authenticate, postController.delete);

export default router;
