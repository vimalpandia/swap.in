import { reelRepository } from '../repositories/reel.repository';
import { wasteTimeRepository } from '../repositories/wasteTime.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { redisClient } from '../config/redis';
import { ReelItem, MoodType } from '@swap/shared';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class ReelService {
  async createReel(userId: string, data: any): Promise<ReelItem> {
    const reel = await reelRepository.create({
      authorId: userId,
      coAuthorId: data.coAuthorId,
      caption: data.caption,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      hlsPlaylistUrl: data.hlsPlaylistUrl,
      duration: data.duration,
      audioName: data.audioName,
      mood: data.mood,
      hashtags: data.hashtags,
      duetParentReelId: data.duetParentReelId,
    });

    // If collab co-author was invited, send notification
    if (data.coAuthorId) {
      await notificationRepository.create({
        recipientId: data.coAuthorId,
        actorId: userId,
        type: 'COLLAB_INVITE',
        reelId: reel.id,
      });
    }

    // Invalidate cached feeds
    await this.invalidateReelCache();

    return reel;
  }

  async getReelsFeed(params: {
    viewerId?: string;
    mood?: MoodType;
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(params.limit || 10, 50);
    const cacheKey = `reels:feed:${params.mood || 'all'}:${params.cursor || 'start'}`;

    if (!params.viewerId) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // Cache miss
      }
    }

    const result = await reelRepository.getReelsFeed({
      viewerId: params.viewerId,
      mood: params.mood,
      cursor: params.cursor,
      limit,
    });

    // Score and rank reels using recommendation formula
    const now = Date.now();
    const scoredReels = result.reels.map((item: ReelItem) => {
      const score = this.calculateRecommendationScore(item, params.mood, now);
      return {
        ...item,
        recommendationScore: score,
      };
    });

    // Sort by recommendation score descending
    scoredReels.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

    const response = {
      items: scoredReels,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };

    // Cache unauthenticated public feed for 60 seconds in Redis
    if (!params.viewerId) {
      try {
        await redisClient.setex(cacheKey, 60, JSON.stringify(response));
      } catch {
        // Cache set error resilient
      }
    }

    return response;
  }

  /**
   * Recommendation algorithm for reels feed:
   * Score = (Likes * 3 + Comments * 4 + Saves * 5 + min(Views, 1000) * 0.2) * (1 / (1 + ageHours)^0.7) + moodMatchBonus
   */
  private calculateRecommendationScore(reel: ReelItem, targetMood?: MoodType, nowMs = Date.now()): number {
    const ageHours = Math.max(0.1, (nowMs - new Date(reel.createdAt).getTime()) / (1000 * 60 * 60));
    const recencyDecay = 1 / Math.pow(1 + ageHours, 0.7);

    const engagement =
      reel.likesCount * 3 +
      reel.commentsCount * 4 +
      reel.savesCount * 5 +
      Math.min(reel.viewCount, 1000) * 0.2;

    const moodBonus = targetMood && reel.mood === targetMood ? 50 : 0;
    const finalScore = engagement * recencyDecay + moodBonus;

    return Math.round(finalScore * 100) / 100;
  }

  async logWatchTime(userId: string, reelId: string, durationSeconds: number) {
    await Promise.all([
      reelRepository.incrementViewCount(reelId),
      wasteTimeRepository.logTime(userId, reelId, durationSeconds),
    ]);
    return { success: true };
  }

  async toggleLike(userId: string, reelId: string) {
    const reel = await reelRepository.findById(reelId);
    if (!reel) throw new NotFoundError('Reel not found');

    const isLiked = await reelRepository.toggleLike(userId, reelId);

    if (isLiked && reel.author.id !== userId) {
      await notificationRepository.create({
        recipientId: reel.author.id,
        actorId: userId,
        type: 'LIKE',
        reelId,
      });
    }

    return { isLiked };
  }

  async toggleSave(userId: string, reelId: string) {
    const reel = await reelRepository.findById(reelId);
    if (!reel) throw new NotFoundError('Reel not found');

    const isSaved = await reelRepository.toggleSave(userId, reelId);
    return { isSaved };
  }

  async respondToCollab(userId: string, reelId: string, accept: boolean) {
    const reel = await reelRepository.findById(reelId);
    if (!reel || reel.coAuthor?.id !== userId) {
      throw new BadRequestError('Collab invitation not found for this user');
    }

    const status = accept ? 'ACCEPTED' : 'REJECTED';
    await reelRepository.updateCollabStatus(reelId, userId, status);

    if (accept) {
      await notificationRepository.create({
        recipientId: reel.author.id,
        actorId: userId,
        type: 'COLLAB_ACCEPTED',
        reelId,
      });
    }

    return { status };
  }

  private async invalidateReelCache() {
    try {
      const keys = await redisClient.keys('reels:feed:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Resilient
    }
  }
}

export const reelService = new ReelService();
