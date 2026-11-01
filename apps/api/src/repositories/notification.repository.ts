import { Notification, INotification, User } from '../models';
import { NotificationType, NotificationItem } from '@swap/shared';
import { Types } from 'mongoose';

function mapNotificationToItem(n: any): NotificationItem {
  const actorObj = n.actor?.toObject ? n.actor.toObject() : n.actor || {};
  return {
    id: n._id ? n._id.toString() : n.id,
    type: n.type,
    actor: {
      id: (actorObj._id || actorObj.id || n.actor || '').toString(),
      username: actorObj.username || 'user',
      name: actorObj.name || actorObj.username || 'User',
      avatarUrl: actorObj.avatarUrl || null,
    },
    recipientId: (n.recipient?._id || n.recipient || '').toString(),
    postId: n.post ? n.post.toString() : null,
    reelId: n.reel ? n.reel.toString() : null,
    commentId: n.comment ? n.comment.toString() : null,
    capsuleId: n.capsule ? n.capsule.toString() : null,
    swapChallengeId: n.swapChallenge ? n.swapChallenge.toString() : null,
    read: !!n.read,
    previewText: n.previewText || null,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class NotificationRepository {
  async create(data: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    postId?: string | null;
    reelId?: string | null;
    commentId?: string | null;
    capsuleId?: string | null;
    swapChallengeId?: string | null;
    previewText?: string | null;
  }): Promise<NotificationItem | null> {
    if (data.recipientId === data.actorId) {
      // Don't notify self of own actions
      return null;
    }
    if (!Types.ObjectId.isValid(data.recipientId) || !Types.ObjectId.isValid(data.actorId)) {
      return null;
    }

    const doc = await Notification.create({
      recipient: new Types.ObjectId(data.recipientId),
      actor: new Types.ObjectId(data.actorId),
      type: data.type,
      post: data.postId && Types.ObjectId.isValid(data.postId) ? new Types.ObjectId(data.postId) : null,
      reel: data.reelId && Types.ObjectId.isValid(data.reelId) ? new Types.ObjectId(data.reelId) : null,
      comment:
        data.commentId && Types.ObjectId.isValid(data.commentId)
          ? new Types.ObjectId(data.commentId)
          : null,
      capsule:
        data.capsuleId && Types.ObjectId.isValid(data.capsuleId)
          ? new Types.ObjectId(data.capsuleId)
          : null,
      swapChallenge:
        data.swapChallengeId && Types.ObjectId.isValid(data.swapChallengeId)
          ? new Types.ObjectId(data.swapChallengeId)
          : null,
      previewText: data.previewText || null,
    });

    const populated = await Notification.findById(doc._id).populate('actor');
    return mapNotificationToItem(populated);
  }

  async getUserNotifications(userId: string, limit = 30): Promise<NotificationItem[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor');

    return notifications.map(mapNotificationToItem);
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) return 0;
    return Notification.countDocuments({
      recipient: userId,
      read: false,
    });
  }

  async markAsRead(notificationId: string, recipientId: string) {
    if (!Types.ObjectId.isValid(notificationId)) return false;
    const res = await Notification.updateOne(
      { _id: notificationId, recipient: recipientId },
      { $set: { read: true } }
    );
    return res.modifiedCount > 0;
  }

  async markAllAsRead(recipientId: string) {
    if (!Types.ObjectId.isValid(recipientId)) return false;
    const res = await Notification.updateMany(
      { recipient: recipientId, read: false },
      { $set: { read: true } }
    );
    return res.modifiedCount > 0;
  }
}

export const notificationRepository = new NotificationRepository();
