import { Router } from 'express';
import { streakController } from '../controllers/streak.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, streakController.getMyStreaks);

export default router;

