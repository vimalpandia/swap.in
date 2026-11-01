import { SwapChallenge, ISwapChallenge, Reel, User } from '../models';
import { SwapChallengeItem, ReelItem, UserSummary } from '@swap/shared';
import { Types } from 'mongoose';

function toUserSummary(u: any): UserSummary {
  const obj = u?.toObject ? u.toObject() : u || {};
  return {
    id: (obj._id || obj.id || '').toString(),
    username: obj.username || 'user',
    name: obj.name || obj.username || 'User',
    avatarUrl: obj.avatarUrl || null,
  };
}

function toReelItem(r: any): ReelItem {
  const obj = r?.toObject ? r.toObject() : r || {};
  return {
    id: (obj._id || obj.id || '').toString(),
    caption: obj.caption || null,
    videoUrl: obj.videoUrl || '',
    thumbnailUrl: obj.thumbnailUrl || '',
    hlsPlaylistUrl: obj.hlsPlaylistUrl || null,
    duration: obj.duration || 15,
    audioName: obj.audioName || 'Original Audio',
    mood: obj.mood || null,
    author: toUserSummary(obj.author),
    likesCount: obj.likesCount || 0,
    commentsCount: obj.commentsCount || 0,
    sharesCount: obj.sharesCount || 0,
    savesCount: obj.savesCount || 0,
    viewCount: obj.viewCount || 0,
    isLiked: false,
    isSaved: false,
    hashtags: obj.hashtags || [],
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapChallengeToItem(c: any): SwapChallengeItem {
  return {
    id: c._id ? c._id.toString() : c.id,
    prompt: c.prompt,
    initiator: toUserSummary(c.initiator),
    recipient: toUserSummary(c.recipient),
    initiatorReel: toReelItem(c.initiatorReel),
    replyReel: c.replyReel ? toReelItem(c.replyReel) : null,
    status: c.status,
    isDuet: !!c.isDuet,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    completedAt: c.completedAt ? new Date(c.completedAt).toISOString() : null,
  };
}

export class SwapChallengeRepository {
  async create(data: {
    prompt: string;
    initiatorId: string;
    recipientId: string;
    initiatorReelId: string;
  }): Promise<SwapChallengeItem> {
    const challenge = await SwapChallenge.create({
      prompt: data.prompt,
      initiator: new Types.ObjectId(data.initiatorId),
      recipient: new Types.ObjectId(data.recipientId),
      initiatorReel: new Types.ObjectId(data.initiatorReelId),
      status: 'PENDING',
      isDuet: true,
    });

    const populated = await SwapChallenge.findById(challenge._id)
      .populate('initiator')
      .populate('recipient')
      .populate({ path: 'initiatorReel', populate: { path: 'author' } });

    return mapChallengeToItem(populated);
  }

  async reply(
    challengeId: string,
    recipientId: string,
    replyReelId: string
  ): Promise<SwapChallengeItem | null> {
    if (!Types.ObjectId.isValid(challengeId) || !Types.ObjectId.isValid(replyReelId)) return null;

    const challenge = await SwapChallenge.findOne({
      _id: challengeId,
      recipient: recipientId,
    });

    if (!challenge) return null;

    challenge.replyReel = new Types.ObjectId(replyReelId);
    challenge.status = 'COMPLETED';
    challenge.completedAt = new Date();
    await challenge.save();

    // Link the reply reel to parent duet reel
    await Reel.findByIdAndUpdate(replyReelId, {
      $set: { duetParentReel: challenge.initiatorReel },
    });

    const populated = await SwapChallenge.findById(challenge._id)
      .populate('initiator')
      .populate('recipient')
      .populate({ path: 'initiatorReel', populate: { path: 'author' } })
      .populate({ path: 'replyReel', populate: { path: 'author' } });

    return mapChallengeToItem(populated);
  }

  async findById(id: string): Promise<SwapChallengeItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const challenge = await SwapChallenge.findById(id)
      .populate('initiator')
      .populate('recipient')
      .populate({ path: 'initiatorReel', populate: { path: 'author' } })
      .populate({ path: 'replyReel', populate: { path: 'author' } });

    if (!challenge) return null;
    return mapChallengeToItem(challenge);
  }

  async getUserChallenges(userId: string): Promise<{
    pending: SwapChallengeItem[];
    completed: SwapChallengeItem[];
  }> {
    if (!Types.ObjectId.isValid(userId)) return { pending: [], completed: [] };
    const uId = new Types.ObjectId(userId);

    const challenges = await SwapChallenge.find({
      $or: [{ initiator: uId }, { recipient: uId }],
    })
      .sort({ createdAt: -1 })
      .populate('initiator')
      .populate('recipient')
      .populate({ path: 'initiatorReel', populate: { path: 'author' } })
      .populate({ path: 'replyReel', populate: { path: 'author' } });

    const pending: SwapChallengeItem[] = [];
    const completed: SwapChallengeItem[] = [];

    challenges.forEach((c) => {
      const item = mapChallengeToItem(c);
      if (item.status === 'COMPLETED') {
        completed.push(item);
      } else {
        pending.push(item);
      }
    });

    return { pending, completed };
  }

  async getDuetsFeed(cursor?: string, limit = 10) {
    const query: any = {
      status: 'COMPLETED',
      replyReel: { $ne: null },
    };

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const items = await SwapChallenge.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('initiator')
      .populate('recipient')
      .populate({ path: 'initiatorReel', populate: { path: 'author' } })
      .populate({ path: 'replyReel', populate: { path: 'author' } });

    let nextCursor: string | null = null;
    let hasMore = false;

    if (items.length > limit) {
      hasMore = true;
      items.pop();
      nextCursor = items[items.length - 1]?._id.toString() || null;
    }

    return {
      duets: items.map(mapChallengeToItem),
      nextCursor,
      hasMore,
    };
  }
}

export const swapChallengeRepository = new SwapChallengeRepository();

