import { SwapDayMatch, ISwapDayMatch, User, Post, Follow } from '../models';
import { SwapDayMatchItem, PostItem, UserSummary } from '@swap/shared';
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

function toPostItem(p: any): PostItem {
  const obj = p?.toObject ? p.toObject() : p || {};
  const authorObj = obj.author || {};
  return {
    id: (obj._id || obj.id || '').toString(),
    caption: obj.caption || null,
    location: obj.location || null,
    mood: obj.mood || null,
    author: toUserSummary(authorObj),
    media: (obj.media || []).map((m: any) => ({
      url: m.url,
      type: m.type || 'IMAGE',
      width: m.width,
      height: m.height,
      order: m.order ?? 0,
    })),
    likesCount: obj.likesCount || 0,
    commentsCount: obj.commentsCount || 0,
    savesCount: obj.savesCount || 0,
    isLiked: false,
    isSaved: false,
    hashtags: obj.hashtags || [],
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class SwapDayRepository {
  async getDailyMatch(userId: string): Promise<SwapDayMatchItem | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    const today = new Date().toISOString().split('T')[0];
    const uId = new Types.ObjectId(userId);

    // 1. Check if user already has a match for today
    let match = await SwapDayMatch.findOne({
      date: today,
      $or: [{ user1: uId }, { user2: uId }],
    })
      .populate('user1')
      .populate('user2');

    // 2. If not, match with a mutual follower
    if (!match) {
      // Find mutual follows
      const myFollowings = await Follow.find({ follower: uId, status: 'ACCEPTED' }).select('following');
      const followingIds = myFollowings.map((f) => f.following);

      const mutuals = await Follow.find({
        follower: { $in: followingIds },
        following: uId,
        status: 'ACCEPTED',
      }).select('follower');

      const mutualIds = mutuals.map((m) => m.follower);

      // Check which mutuals haven't been matched today
      const alreadyMatchedToday = await SwapDayMatch.find({
        date: today,
      }).select('user1 user2');

      const matchedSet = new Set<string>();
      alreadyMatchedToday.forEach((m) => {
        matchedSet.add(m.user1.toString());
        matchedSet.add(m.user2.toString());
      });

      const eligibleMutualIds = mutualIds.filter((id) => !matchedSet.has(id.toString()));

      let partnerId: Types.ObjectId | null = null;
      if (eligibleMutualIds.length > 0) {
        // Pick one randomly
        partnerId = eligibleMutualIds[Math.floor(Math.random() * eligibleMutualIds.length)];
      } else if (mutualIds.length > 0) {
        partnerId = mutualIds[Math.floor(Math.random() * mutualIds.length)];
      } else {
        // Fallback: pick any active user other than self
        const anyUser = await User.findOne({ _id: { $ne: uId }, deletedAt: null }).select('_id');
        if (anyUser) {
          partnerId = anyUser._id;
        }
      }

      if (partnerId) {
        match = await SwapDayMatch.create({
          date: today,
          user1: uId,
          user2: partnerId,
        });

        match = await SwapDayMatch.findById(match._id).populate('user1').populate('user2');
      }
    }

    if (!match) return null;

    const isUser1 = match.user1._id.toString() === userId;
    const partner = isUser1 ? match.user2 : match.user1;
    const partnerVibeNote = isUser1 ? match.user2VibeNote : match.user1VibeNote;
    const myVibeNote = isUser1 ? match.user1VibeNote : match.user2VibeNote;

    // Fetch partner's top highlights (up to 6 top posts by likes)
    const partnerPosts = await Post.find({
      author: partner._id,
      deletedAt: null,
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(6)
      .populate('author');

    return {
      id: match._id.toString(),
      date: match.date,
      partner: toUserSummary(partner),
      partnerVibeNote: partnerVibeNote || null,
      myVibeNote: myVibeNote || null,
      partnerHighlights: partnerPosts.map(toPostItem),
    };
  }

  async saveVibeNote(userId: string, matchId: string, note: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(matchId)) return false;

    const match = await SwapDayMatch.findById(matchId);
    if (!match) return false;

    if (match.user1.toString() === userId) {
      match.user1VibeNote = note;
    } else if (match.user2.toString() === userId) {
      match.user2VibeNote = note;
    } else {
      return false;
    }

    await match.save();
    return true;
  }
}

export const swapDayRepository = new SwapDayRepository();

