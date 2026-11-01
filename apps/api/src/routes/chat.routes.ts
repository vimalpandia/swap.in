import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { sendMessageSchema, createConversationSchema } from '@swap/shared';

const router = Router();

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/direct/:recipientId', authenticate, chatController.getDirectConversation);
router.post('/group', authenticate, validateBody(createConversationSchema), chatController.createGroup);
router.get('/conversations/:id/messages', authenticate, chatController.getMessages);
router.post('/messages', authenticate, validateBody(sendMessageSchema), chatController.sendMessage);
router.post('/conversations/:id/read', authenticate, chatController.markAsRead);
router.post('/messages/:messageId/reaction', authenticate, chatController.toggleReaction);
router.delete('/messages/:messageId', authenticate, chatController.deleteMessage);

export default router;
