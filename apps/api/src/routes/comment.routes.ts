import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { addCommentSchema } from '@swap/shared';

const router = Router();

router.get('/', optionalAuthenticate, commentController.getComments);
router.post('/', authenticate, validateBody(addCommentSchema), commentController.addComment);
router.post('/:id/like', authenticate, commentController.toggleLike);
router.delete('/:id', authenticate, commentController.delete);

export default router;
