import { userRepository } from '../repositories/user.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { UserProfile, UserSummary, VibeType } from '@swap/shared';

export class UserService {
  async getProfile(username: string, viewerId?: string): Promise<UserProfile> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError(`User @${username} not found`);
    }

    const stats = await userRepository.countStats(user.id);
    let isFollowing = false;
    let isFollowedBy = false;

    if (viewerId && viewerId !== user.id) {
      isFollowing = await userRepository.isFollowing(viewerId, user.id);
      isFollowedBy = await userRepository.isFollowing(user.id, viewerId);
    }

    return {
      id: user.id,
      username: user.username,
      name: user.profile?.name || user.username,
      bio: user.profile?.bio || null,
      website: user.profile?.website || null,
      avatarUrl: user.profile?.avatarUrl || null,
      isPrivate: user.profile?.isPrivate || false,
      ghostMode: user.profile?.ghostMode || false,
      activeVibe: user.profile?.activeVibe || (user as any).activeVibe || 'CHILL',
      focusGuardMinutes: user.profile?.focusGuardMinutes || 30,
      currentStreakCount: user.profile?.currentStreakCount || 0,
      followersCount: stats.followersCount,
      followingCount: stats.followingCount,
      postsCount: stats.postsCount,
      reelsCount: stats.reelsCount,
      isFollowing,
      isFollowedBy,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateProfile(userId: string, data: any) {
    const updated = await userRepository.updateProfile(userId, data);
    return updated;
  }

  async updateVibe(userId: string, activeVibe: VibeType) {
    const updated = await userRepository.updateVibe(userId, activeVibe);
    return updated;
  }

  async followUser(followerId: string, targetUserId: string) {
    if (followerId === targetUserId) {
      throw new BadRequestError('Cannot follow yourself');
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('Target user not found');
    }

    const isPrivate = targetUser.profile?.isPrivate ?? false;
    const follow = await userRepository.followUser(followerId, targetUserId, isPrivate);

    // Send notification
    await notificationRepository.create({
      recipientId: targetUserId,
      actorId: followerId,
      type: 'FOLLOW',
    });

    return {
      status: follow.status,
      isFollowing: follow.status === 'ACCEPTED',
    };
  }

  async unfollowUser(followerId: string, targetUserId: string) {
    await userRepository.unfollowUser(followerId, targetUserId);
    return { success: true, isFollowing: false };
  }

  async search(query: string): Promise<UserSummary[]> {
    if (!query || query.trim().length === 0) return [];
    const users = await userRepository.searchUsers(query.trim(), 10);
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.profile?.name || u.username,
      avatarUrl: u.profile?.avatarUrl || null,
    }));
  }
}

export const userService = new UserService();
