import { Reel, IReel, Like, Save, User, Hashtag } from '../models';
import { MoodType, CollabStatus, ReelItem } from '@swap/shared';
import { Types } from 'mongoose';

export interface CreateReelInput {
  authorId: string;
  coAuthorId?: string | null;
  caption?: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  hlsPlaylistUrl?: string | null;
  duration: number;
  audioName?: string;
  mood?: MoodType | null;
  hashtags?: string[];
  duetParentReelId?: string | null;
}

function mapReelToItem(reel: any, viewerLiked = false, viewerSaved = false): ReelItem {
  const authorObj = reel.author?.toObject ? reel.author.toObject() : reel.author || {};
  const coAuthorObj = reel.coAuthor?.toObject ? reel.coAuthor.toObject() : reel.coAuthor || null;

  return {
    id: reel._id ? reel._id.toString() : reel.id,
    caption: reel.caption || null,
    videoUrl: reel.videoUrl,
    thumbnailUrl: reel.thumbnailUrl,
    hlsPlaylistUrl: reel.hlsPlaylistUrl || null,
    duration: reel.duration || 15,
    audioName: reel.audioName || 'Original Audio',
    mood: reel.mood || null,
    author: {
      id: (authorObj._id || authorObj.id || reel.author || '').toString(),
      username: authorObj.username || 'user',
      name: authorObj.name || authorObj.username || 'User',
      avatarUrl: authorObj.avatarUrl || null,
    },
    coAuthor: coAuthorObj
      ? {
          id: (coAuthorObj._id || coAuthorObj.id).toString(),
          username: coAuthorObj.username || 'user',
          name: coAuthorObj.name || coAuthorObj.username || 'User',
          avatarUrl: coAuthorObj.avatarUrl || null,
        }
      : null,
    collabStatus: reel.collabStatus || null,
    likesCount: reel.likesCount || 0,
    commentsCount: reel.commentsCount || 0,
    sharesCount: reel.sharesCount || 0,
    savesCount: reel.savesCount || 0,
    viewCount: reel.viewCount || 0,
    isLiked: viewerLiked,
    isSaved: viewerSaved,
    hashtags: reel.hashtags || [],
    duetParentReelId: reel.duetParentReel ? reel.duetParentReel.toString() : null,
    createdAt: reel.createdAt ? new Date(reel.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class ReelRepository {
  async findById(id: string, viewerId?: string): Promise<ReelItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const reel = await Reel.findOne({ _id: id, deletedAt: null })
      .populate('author')
      .populate('coAuthor');
    if (!reel) return null;

    let viewerLiked = false;
    let viewerSaved = false;

    if (viewerId && Types.ObjectId.isValid(viewerId)) {
      const [like, save] = await Promise.all([
        Like.findOne({ user: viewerId, reel: id }),
        Save.findOne({ user: viewerId, reel: id }),
      ]);
      viewerLiked = !!like;
      viewerSaved = !!save;
    }

    return mapReelToItem(reel, viewerLiked, viewerSaved);
  }

  async create(data: CreateReelInput): Promise<ReelItem> {
    const reel = await Reel.create({
      author: new Types.ObjectId(data.authorId),
      coAuthor: data.coAuthorId ? new Types.ObjectId(data.coAuthorId) : null,
      collabStatus: data.coAuthorId ? 'PENDING' : null,
      caption: data.caption,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      hlsPlaylistUrl: data.hlsPlaylistUrl,
      duration: data.duration,
      audioName: data.audioName || 'Original Audio',
      mood: data.mood,
      hashtags: data.hashtags || [],
      duetParentReel: data.duetParentReelId ? new Types.ObjectId(data.duetParentReelId) : null,
    });

    await User.findByIdAndUpdate(data.authorId, { $inc: { reelsCount: 1 } });

    if (data.hashtags && data.hashtags.length > 0) {
      await Promise.all(
        data.hashtags.map((tag) =>
          Hashtag.findOneAndUpdate(
            { name: tag.toLowerCase() },
            { $inc: { reelCount: 1 } },
            { upsert: true }
          )
        )
      );
    }

    const populated = await Reel.findById(reel._id).populate('author').populate('coAuthor');
    return mapReelToItem(populated);
  }

  async getReelsFeed(params: {
    viewerId?: string;
    mood?: MoodType;
    cursor?: string;
    limit: number;
  }) {
    const { viewerId, mood, cursor, limit } = params;

    const query: any = { deletedAt: null };

    if (mood) {
      query.mood = mood;
    }

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const reels = await Reel.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('author')
      .populate('coAuthor');

    let nextCursor: string | null = null;
    let hasMore = false;

    if (reels.length > limit) {
      hasMore = true;
      reels.pop();
      nextCursor = reels[reels.length - 1]?._id.toString() || null;
    }

    let likedReelIds = new Set<string>();
    let savedReelIds = new Set<string>();

    if (viewerId && Types.ObjectId.isValid(viewerId) && reels.length > 0) {
      const reelIds = reels.map((r) => r._id);
      const [likes, saves] = await Promise.all([
        Like.find({ user: viewerId, reel: { $in: reelIds } }).select('reel'),
        Save.find({ user: viewerId, reel: { $in: reelIds } }).select('reel'),
      ]);
      likedReelIds = new Set(likes.map((l) => l.reel?.toString() || ''));
      savedReelIds = new Set(saves.map((s) => s.reel?.toString() || ''));
    }

    const items = reels.map((r) =>
      mapReelToItem(
        r,
        likedReelIds.has(r._id.toString()),
        savedReelIds.has(r._id.toString())
      )
    );

    return { reels: items, nextCursor, hasMore };
  }

  async incrementViewCount(id: string) {
    if (!Types.ObjectId.isValid(id)) return;
    return Reel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async toggleLike(userId: string, reelId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(reelId)) return false;

    const existing = await Like.findOne({ user: userId, reel: reelId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Reel.findByIdAndUpdate(reelId, { $inc: { likesCount: -1 } });
      return false;
    } else {
      await Like.create({ user: userId, reel: reelId });
      await Reel.findByIdAndUpdate(reelId, { $inc: { likesCount: 1 } });
      return true;
    }
  }

  async toggleSave(userId: string, reelId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(reelId)) return false;

    const existing = await Save.findOne({ user: userId, reel: reelId });

    if (existing) {
      await Save.deleteOne({ _id: existing._id });
      await Reel.findByIdAndUpdate(reelId, { $inc: { savesCount: -1 } });
      return false;
    } else {
      await Save.create({ user: userId, reel: reelId });
      await Reel.findByIdAndUpdate(reelId, { $inc: { savesCount: 1 } });
      return true;
    }
  }

  async updateCollabStatus(reelId: string, coAuthorId: string, status: CollabStatus) {
    if (!Types.ObjectId.isValid(reelId)) return false;
    const res = await Reel.updateOne(
      { _id: reelId, coAuthor: coAuthorId },
      { $set: { collabStatus: status } }
    );
    return res.modifiedCount > 0;
  }
}

export const reelRepository = new ReelRepository();
