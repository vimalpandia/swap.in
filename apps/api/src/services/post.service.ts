import { postRepository } from '../repositories/post.repository';
import { userRepository } from '../repositories/user.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { PostItem, MoodType } from '@swap/shared';
import { NotFoundError } from '../utils/errors';

export class PostService {
  async createPost(userId: string, data: any): Promise<PostItem> {
    return postRepository.create({
      authorId: userId,
      caption: data.caption,
      location: data.location,
      mood: data.mood,
      media: data.media,
      hashtags: data.hashtags,
    });
  }

  async getFeed(params: {
    viewerId?: string;
    mood?: MoodType;
    cursor?: string;
    limit?: number;
    followedOnly?: boolean;
  }) {
    const limit = Math.min(params.limit || 50, 100);
    let followingIds: string[] | undefined;

    if (params.viewerId && params.followedOnly) {
      const following = await userRepository.getFollowing(params.viewerId);
      followingIds = following.map((f: any) => f.following?.id || f.followingId);
      followingIds.push(params.viewerId); // Include self
    }

    const result = await postRepository.getFeed({
      viewerId: params.viewerId,
      mood: params.mood,
      cursor: params.cursor,
      limit,
      followedOnly: params.followedOnly,
      followingIds,
    });

    return {
      items: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async getPostById(id: string, viewerId?: string): Promise<PostItem> {
    const post = await postRepository.findById(id, viewerId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  async toggleLike(userId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    const isLiked = await postRepository.toggleLike(userId, postId);

    if (isLiked && post.author.id !== userId) {
      await notificationRepository.create({
        recipientId: post.author.id,
        actorId: userId,
        type: 'LIKE',
        postId,
      });
    }

    return { isLiked };
  }

  async toggleSave(userId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    const isSaved = await postRepository.toggleSave(userId, postId);
    return { isSaved };
  }

  async deletePost(id: string, authorId: string) {
    const success = await postRepository.deletePost(id, authorId);
    if (!success) {
      throw new NotFoundError('Post not found or unauthorized');
    }
    return { success: true };
  }
}

export const postService = new PostService();
