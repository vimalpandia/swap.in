import { Request, Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/notification.repository';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationRepository.getUserNotifications(req.user!.userId);
      const unreadCount = await notificationRepository.getUnreadCount(req.user!.userId);
      return sendSuccess(res, { notifications, unreadCount });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationRepository.markAsRead(id, req.user!.userId);
      return sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAllAsRead(req.user!.userId);
      return sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();

