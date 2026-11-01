import { commentRepository } from '../repositories/comment.repository';
import { postRepository } from '../repositories/post.repository';
import { reelRepository } from '../repositories/reel.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { CommentItem } from '@swap/shared';

export class CommentService {
  async addComment(userId: string, data: any): Promise<CommentItem> {
    const comment = await commentRepository.create({
      authorId: userId,
      content: data.content,
      postId: data.postId,
      reelId: data.reelId,
      parentId: data.parentId,
    });

    // Notify post or reel author
    if (data.postId) {
      const post = await postRepository.findById(data.postId);
      if (post && post.author.id !== userId) {
        await notificationRepository.create({
          recipientId: post.author.id,
          actorId: userId,
          type: 'COMMENT',
          postId: data.postId,
          commentId: comment.id,
        });
      }
    } else if (data.reelId) {
      const reel = await reelRepository.findById(data.reelId);
      if (reel && reel.author.id !== userId) {
        await notificationRepository.create({
          recipientId: reel.author.id,
          actorId: userId,
          type: 'COMMENT',
          reelId: data.reelId,
          commentId: comment.id,
        });
      }
    }

    return comment;
  }

  async getComments(params: {
    postId?: string;
    reelId?: string;
    viewerId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const result = await commentRepository.getComments({
      postId: params.postId,
      reelId: params.reelId,
      viewerId: params.viewerId,
      cursor: params.cursor,
      limit: params.limit || 20,
    });

    return {
      items: result.comments,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async toggleLike(userId: string, commentId: string) {
    const isLiked = await commentRepository.toggleLike(userId, commentId);
    return { isLiked };
  }

  async deleteComment(commentId: string, authorId: string) {
    await commentRepository.delete(commentId, authorId);
    return { success: true };
  }
}

export const commentService = new CommentService();
