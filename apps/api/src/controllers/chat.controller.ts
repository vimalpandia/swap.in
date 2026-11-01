import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { sendSuccess } from '../utils/response';

export class ChatController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const convs = await chatService.getUserConversations(req.user!.userId);
      return sendSuccess(res, convs);
    } catch (err) {
      next(err);
    }
  }

  async getDirectConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientId } = req.params;
      const conv = await chatService.getOrCreateDirectConversation(req.user!.userId, recipientId);
      return sendSuccess(res, conv);
    } catch (err) {
      next(err);
    }
  }

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { participantIds, title } = req.body;
      const conv = await chatService.createGroupConversation(
        req.user!.userId,
        participantIds,
        title || 'Group Chat'
      );
      return sendSuccess(res, conv, 201);
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cursor, limit } = req.query;
      const result = await chatService.getMessages(
        id,
        cursor as string,
        limit ? parseInt(limit as string, 10) : undefined
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await chatService.sendMessage(req.user!.userId, req.body);
      return sendSuccess(res, message, 201);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await chatService.markAsRead(id, req.user!.userId);
      return sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async toggleReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const result = await chatService.toggleReaction(messageId, req.user!.userId, emoji);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      await chatService.deleteMessage(messageId, req.user!.userId);
      return sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();

