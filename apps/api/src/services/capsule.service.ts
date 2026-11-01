import { capsuleRepository } from '../repositories/capsule.repository';
import { TimeCapsuleItem } from '@swap/shared';

export class CapsuleService {
  async createCapsule(userId: string, data: any): Promise<TimeCapsuleItem> {
    return capsuleRepository.create({
      authorId: userId,
      recipientId: data.recipientId,
      title: data.title,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      unlocksAt: new Date(data.unlocksAt),
    });
  }

  async getCapsules(viewerId: string): Promise<TimeCapsuleItem[]> {
    return capsuleRepository.getCapsules(viewerId);
  }
}

export const capsuleService = new CapsuleService();
