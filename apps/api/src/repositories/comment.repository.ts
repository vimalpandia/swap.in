import { Comment, IComment, Like, Post, Reel } from '../models';
import { CommentItem } from '@swap/shared';
import { Types } from 'mongoose';

function mapCommentToItem(c: any, viewerLiked = false, replies: CommentItem[] = []): CommentItem {
  const authorObj = c.author?.toObject ? c.author.toObject() : c.author || {};
  return {
    id: c._id ? c._id.toString() : c.id,
    content: c.content,
    postId: c.post ? c.post.toString() : null,
    reelId: c.reel ? c.reel.toString() : null,
    parentId: c.parent ? c.parent.toString() : null,
    author: {
      id: (authorObj._id || authorObj.id || c.author || '').toString(),
      username: authorObj.username || 'user',
      name: authorObj.name || authorObj.username || 'User',
      avatarUrl: authorObj.avatarUrl || null,
    },
    likesCount: c.likesCount || 0,
    isLiked: viewerLiked,
    replyCount: c.replyCount || 0,
    replies,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class CommentRepository {
  async create(data: {
    authorId: string;
    content: string;
    postId?: string | null;
    reelId?: string | null;
    parentId?: string | null;
  }): Promise<CommentItem> {
    const comment = await Comment.create({
      author: new Types.ObjectId(data.authorId),
      content: data.content,
      post: data.postId ? new Types.ObjectId(data.postId) : null,
      reel: data.reelId ? new Types.ObjectId(data.reelId) : null,
      parent: data.parentId ? new Types.ObjectId(data.parentId) : null,
    });

    if (data.postId && Types.ObjectId.isValid(data.postId)) {
      await Post.findByIdAndUpdate(data.postId, { $inc: { commentsCount: 1 } });
    }
    if (data.reelId && Types.ObjectId.isValid(data.reelId)) {
      await Reel.findByIdAndUpdate(data.reelId, { $inc: { commentsCount: 1 } });
    }
    if (data.parentId && Types.ObjectId.isValid(data.parentId)) {
      await Comment.findByIdAndUpdate(data.parentId, { $inc: { replyCount: 1 } });
    }

    const populated = await Comment.findById(comment._id).populate('author');
    return mapCommentToItem(populated);
  }

  async getComments(params: {
    postId?: string;
    reelId?: string;
    viewerId?: string;
    cursor?: string;
    limit: number;
  }) {
    const { postId, reelId, viewerId, cursor, limit } = params;

    const query: any = {
      parent: null,
      deletedAt: null,
    };

    if (postId && Types.ObjectId.isValid(postId)) query.post = new Types.ObjectId(postId);
    if (reelId && Types.ObjectId.isValid(reelId)) query.reel = new Types.ObjectId(reelId);

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const comments = await Comment.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('author');

    let nextCursor: string | null = null;
    let hasMore = false;

    if (comments.length > limit) {
      hasMore = true;
      comments.pop();
      nextCursor = comments[comments.length - 1]?._id.toString() || null;
    }

    const commentIds = comments.map((c) => c._id);

    // Fetch replies for top comments
    const replies = await Comment.find({
      parent: { $in: commentIds },
      deletedAt: null,
    })
      .sort({ _id: 1 })
      .populate('author');

    // Fetch viewer likes
    let likedCommentIds = new Set<string>();
    if (viewerId && Types.ObjectId.isValid(viewerId)) {
      const allIds = [...commentIds, ...replies.map((r) => r._id)];
      const likes = await Like.find({ user: viewerId, comment: { $in: allIds } }).select('comment');
      likedCommentIds = new Set(likes.map((l) => l.comment?.toString() || ''));
    }

    const repliesByParent = new Map<string, CommentItem[]>();
    for (const r of replies) {
      const pId = r.parent?.toString() || '';
      if (!repliesByParent.has(pId)) repliesByParent.set(pId, []);
      repliesByParent.get(pId)!.push(mapCommentToItem(r, likedCommentIds.has(r._id.toString())));
    }

    const items = comments.map((c) =>
      mapCommentToItem(
        c,
        likedCommentIds.has(c._id.toString()),
        repliesByParent.get(c._id.toString()) || []
      )
    );

    return { comments: items, nextCursor, hasMore };
  }

  async toggleLike(userId: string, commentId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(commentId)) return false;

    const existing = await Like.findOne({ user: userId, comment: commentId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
      return false;
    } else {
      await Like.create({ user: userId, comment: commentId });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });
      return true;
    }
  }

  async delete(commentId: string, authorId: string) {
    if (!Types.ObjectId.isValid(commentId)) return false;
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, author: authorId },
      { $set: { deletedAt: new Date() } }
    );
    if (comment) {
      if (comment.post) await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
      if (comment.reel) await Reel.findByIdAndUpdate(comment.reel, { $inc: { commentsCount: -1 } });
      if (comment.parent) await Comment.findByIdAndUpdate(comment.parent, { $inc: { replyCount: -1 } });
      return true;
    }
    return false;
  }
}

export const commentRepository = new CommentRepository();
