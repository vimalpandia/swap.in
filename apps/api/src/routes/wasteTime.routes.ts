import { Router } from 'express';
import { wasteTimeController } from '../controllers/wasteTime.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, wasteTimeController.getDashboard);
router.get('/focus-guard', authenticate, wasteTimeController.getFocusGuardStatus);
router.post('/log', authenticate, wasteTimeController.logTime);

export default router;

