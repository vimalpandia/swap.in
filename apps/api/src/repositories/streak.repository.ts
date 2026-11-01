import { Streak, IStreak, User } from '../models';
import { StreakItem } from '@swap/shared';
import { Types } from 'mongoose';

function toUserSummary(u: any) {
  const obj = u?.toObject ? u.toObject() : u || {};
  return {
    id: (obj._id || obj.id || '').toString(),
    username: obj.username || 'user',
    name: obj.name || obj.username || 'User',
    avatarUrl: obj.avatarUrl || null,
  };
}

export class StreakRepository {
  private getOrderedPair(u1: string, u2: string) {
    return u1 < u2
      ? { user1Id: new Types.ObjectId(u1), user2Id: new Types.ObjectId(u2) }
      : { user1Id: new Types.ObjectId(u2), user2Id: new Types.ObjectId(u1) };
  }

  async recordInteraction(userIdA: string, userIdB: string) {
    if (userIdA === userIdB) return null;
    if (!Types.ObjectId.isValid(userIdA) || !Types.ObjectId.isValid(userIdB)) return null;

    const { user1Id, user2Id } = this.getOrderedPair(userIdA, userIdB);
    const now = new Date();
    const nextExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const existing = await Streak.findOne({
      user1: user1Id,
      user2: user2Id,
    });

    if (!existing) {
      return Streak.create({
        user1: user1Id,
        user2: user2Id,
        currentStreak: 1,
        longestStreak: 1,
        lastInteractionAt: now,
        expiresAt: nextExpiry,
      });
    }

    const isExpired = now.getTime() > new Date(existing.expiresAt).getTime();
    const hoursSinceLast = (now.getTime() - new Date(existing.lastInteractionAt).getTime()) / (1000 * 60 * 60);

    if (isExpired) {
      existing.currentStreak = 1;
      existing.lastInteractionAt = now;
      existing.expiresAt = nextExpiry;
      return existing.save();
    }

    if (hoursSinceLast < 6) {
      existing.expiresAt = nextExpiry;
      return existing.save();
    }

    const newStreak = existing.currentStreak + 1;
    existing.currentStreak = newStreak;
    existing.longestStreak = Math.max(existing.longestStreak, newStreak);
    existing.lastInteractionAt = now;
    existing.expiresAt = nextExpiry;
    return existing.save();
  }

  async getUserStreaks(userId: string): Promise<StreakItem[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const now = new Date();
    const uId = new Types.ObjectId(userId);

    const streaks = await Streak.find({
      $or: [{ user1: uId }, { user2: uId }],
    })
      .sort({ currentStreak: -1 })
      .populate('user1')
      .populate('user2');

    return streaks.map((s: any) => {
      const expiresAt = new Date(s.expiresAt);
      const msLeft = expiresAt.getTime() - now.getTime();
      const isExpiringSoon = msLeft > 0 && msLeft <= 4 * 60 * 60 * 1000;

      return {
        id: s._id.toString(),
        user1: toUserSummary(s.user1),
        user2: toUserSummary(s.user2),
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        lastInteractionAt: s.lastInteractionAt ? new Date(s.lastInteractionAt).toISOString() : now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpiringSoon,
      };
    });
  }
}

export const streakRepository = new StreakRepository();
