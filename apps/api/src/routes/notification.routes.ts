import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.post('/read-all', authenticate, notificationController.markAllAsRead);
router.post('/:id/read', authenticate, notificationController.markAsRead);

export default router;

