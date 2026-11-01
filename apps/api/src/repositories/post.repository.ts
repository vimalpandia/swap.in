import { Post, IPost, Like, Save, User, Hashtag } from '../models';
import { MoodType, MediaType, PostItem } from '@swap/shared';
import { Types } from 'mongoose';

export interface CreatePostInput {
  authorId: string;
  caption?: string | null;
  location?: string | null;
  mood?: MoodType | null;
  media: Array<{
    url: string;
    type: MediaType;
    width?: number;
    height?: number;
    order: number;
  }>;
  hashtags?: string[];
}

function mapPostToItem(post: any, viewerLiked = false, viewerSaved = false): PostItem {
  const authorObj = post.author?.toObject ? post.author.toObject() : post.author || {};
  const authorId = (authorObj._id || authorObj.id || post.author || '').toString();

  return {
    id: post._id ? post._id.toString() : post.id,
    caption: post.caption || null,
    location: post.location || null,
    mood: post.mood || null,
    author: {
      id: authorId,
      username: authorObj.username || 'user',
      name: authorObj.name || authorObj.username || 'User',
      avatarUrl: authorObj.avatarUrl || null,
    },
    media: (post.media || []).map((m: any) => ({
      url: m.url,
      type: m.type || 'IMAGE',
      width: m.width,
      height: m.height,
      order: m.order ?? 0,
    })),
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    savesCount: post.savesCount || 0,
    isLiked: viewerLiked,
    isSaved: viewerSaved,
    hashtags: post.hashtags || [],
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class PostRepository {
  async findById(id: string, viewerId?: string): Promise<PostItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const post = await Post.findOne({ _id: id, deletedAt: null }).populate('author');
    if (!post) return null;

    let viewerLiked = false;
    let viewerSaved = false;

    if (viewerId && Types.ObjectId.isValid(viewerId)) {
      const [like, save] = await Promise.all([
        Like.findOne({ user: viewerId, post: id }),
        Save.findOne({ user: viewerId, post: id }),
      ]);
      viewerLiked = !!like;
      viewerSaved = !!save;
    }

    return mapPostToItem(post, viewerLiked, viewerSaved);
  }

  async create(data: CreatePostInput): Promise<PostItem> {
    const post = await Post.create({
      author: new Types.ObjectId(data.authorId),
      caption: data.caption,
      location: data.location,
      mood: data.mood,
      media: data.media,
      hashtags: data.hashtags || [],
    });

    await User.findByIdAndUpdate(data.authorId, { $inc: { postsCount: 1 } });

    // Track hashtags atomically
    if (data.hashtags && data.hashtags.length > 0) {
      await Promise.all(
        data.hashtags.map((tag) =>
          Hashtag.findOneAndUpdate(
            { name: tag.toLowerCase() },
            { $inc: { postCount: 1 } },
            { upsert: true }
          )
        )
      );
    }

    const populated = await Post.findById(post._id).populate('author');
    return mapPostToItem(populated);
  }

  async getFeed(params: {
    viewerId?: string;
    mood?: MoodType;
    cursor?: string;
    limit: number;
    followedOnly?: boolean;
    followingIds?: string[];
  }) {
    const { viewerId, mood, cursor, limit, followedOnly, followingIds } = params;

    const query: any = { deletedAt: null };

    if (mood) {
      query.mood = mood;
    }

    if (followedOnly && followingIds && followingIds.length > 0) {
      query.author = { $in: followingIds.map((id) => new Types.ObjectId(id)) };
    }

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('author');

    let nextCursor: string | null = null;
    let hasMore = false;

    if (posts.length > limit) {
      hasMore = true;
      posts.pop();
      nextCursor = posts[posts.length - 1]?._id.toString() || null;
    }

    // Check likes and saves in bulk
    let likedPostIds = new Set<string>();
    let savedPostIds = new Set<string>();

    if (viewerId && Types.ObjectId.isValid(viewerId) && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const [likes, saves] = await Promise.all([
        Like.find({ user: viewerId, post: { $in: postIds } }).select('post'),
        Save.find({ user: viewerId, post: { $in: postIds } }).select('post'),
      ]);
      likedPostIds = new Set(likes.map((l) => l.post?.toString() || ''));
      savedPostIds = new Set(saves.map((s) => s.post?.toString() || ''));
    }

    const items = posts.map((p) =>
      mapPostToItem(
        p,
        likedPostIds.has(p._id.toString()),
        savedPostIds.has(p._id.toString())
      )
    );

    return { posts: items, nextCursor, hasMore };
  }

  async toggleLike(userId: string, postId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) return false;

    const existing = await Like.findOne({ user: userId, post: postId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      return false; // unliked
    } else {
      await Like.create({ user: userId, post: postId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      return true; // liked
    }
  }

  async toggleSave(userId: string, postId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) return false;

    const existing = await Save.findOne({ user: userId, post: postId });

    if (existing) {
      await Save.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } });
      return false;
    } else {
      await Save.create({ user: userId, post: postId });
      await Post.findByIdAndUpdate(postId, { $inc: { savesCount: 1 } });
      return true;
    }
  }

  async deletePost(id: string, authorId: string) {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Post.findOneAndUpdate(
      { _id: id, author: authorId },
      { $set: { deletedAt: new Date() } }
    );
    if (result) {
      await User.findByIdAndUpdate(authorId, { $inc: { postsCount: -1 } });
    }
    return !!result;
  }
}

export const postRepository = new PostRepository();
