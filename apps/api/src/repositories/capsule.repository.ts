import { TimeCapsule, ITimeCapsule, User } from '../models';
import { MediaType, TimeCapsuleItem } from '@swap/shared';
import { Types } from 'mongoose';

function mapCapsuleToItem(capsule: any, maskLocked = true): TimeCapsuleItem {
  const authorObj = capsule.author?.toObject ? capsule.author.toObject() : capsule.author || {};
  const recipientObj = capsule.recipient?.toObject ? capsule.recipient.toObject() : capsule.recipient || null;
  const now = new Date();
  const isLocked = new Date(capsule.unlocksAt) > now && !capsule.isUnlocked;

  return {
    id: capsule._id ? capsule._id.toString() : capsule.id,
    title: capsule.title,
    caption: maskLocked && isLocked ? '🔒 Locked until countdown completes' : capsule.caption || null,
    mediaUrl: maskLocked && isLocked ? null : capsule.mediaUrl || null,
    mediaType: maskLocked && isLocked ? null : capsule.mediaType || null,
    author: {
      id: (authorObj._id || authorObj.id || capsule.author || '').toString(),
      username: authorObj.username || 'user',
      name: authorObj.name || authorObj.username || 'User',
      avatarUrl: authorObj.avatarUrl || null,
    },
    recipientUser: recipientObj
      ? {
          id: (recipientObj._id || recipientObj.id).toString(),
          username: recipientObj.username || 'user',
          name: recipientObj.name || recipientObj.username || 'User',
          avatarUrl: recipientObj.avatarUrl || null,
        }
      : null,
    unlocksAt: capsule.unlocksAt ? new Date(capsule.unlocksAt).toISOString() : new Date().toISOString(),
    isUnlocked: !isLocked,
    createdAt: capsule.createdAt ? new Date(capsule.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class CapsuleRepository {
  async create(data: {
    authorId: string;
    recipientId?: string | null;
    title: string;
    caption?: string | null;
    mediaUrl?: string | null;
    mediaType?: MediaType | null;
    unlocksAt: Date;
  }): Promise<TimeCapsuleItem> {
    const capsule = await TimeCapsule.create({
      author: new Types.ObjectId(data.authorId),
      recipient: data.recipientId ? new Types.ObjectId(data.recipientId) : null,
      title: data.title,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      unlocksAt: data.unlocksAt,
      isUnlocked: false,
    });

    const populated = await TimeCapsule.findById(capsule._id)
      .populate('author')
      .populate('recipient');
    return mapCapsuleToItem(populated, false);
  }

  async getCapsules(viewerId: string): Promise<TimeCapsuleItem[]> {
    const now = new Date();

    // Check and update any capsules that have reached their unlock time
    await TimeCapsule.updateMany(
      {
        unlocksAt: { $lte: now },
        isUnlocked: false,
      },
      {
        $set: {
          isUnlocked: true,
          unlockedAt: now,
        },
      }
    );

    const query: any = {
      $or: [
        { author: viewerId },
        { recipient: viewerId },
        { recipient: null }, // Public community capsules
      ],
    };

    const capsules = await TimeCapsule.find(query)
      .sort({ unlocksAt: -1 })
      .populate('author')
      .populate('recipient');

    return capsules.map((c) => mapCapsuleToItem(c, true));
  }

  async findById(id: string): Promise<TimeCapsuleItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const capsule = await TimeCapsule.findById(id).populate('author').populate('recipient');
    if (!capsule) return null;
    return mapCapsuleToItem(capsule, false);
  }
}

export const capsuleRepository = new CapsuleRepository();
