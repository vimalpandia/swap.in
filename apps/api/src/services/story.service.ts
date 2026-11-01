import { storyRepository } from '../repositories/story.repository';
import { userRepository } from '../repositories/user.repository';
import { StoryItem, StoryTrayItem, STORY_EXPIRY_MS } from '@swap/shared';

export class StoryService {
  async createStory(userId: string, data: any): Promise<StoryItem> {
    const expiresAt = new Date(Date.now() + STORY_EXPIRY_MS);

    return storyRepository.create({
      authorId: userId,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      duration: data.duration || 15,
      caption: data.caption,
      expiresAt,
    });
  }

  async getStoryTray(viewerId?: string): Promise<StoryTrayItem[]> {
    let targetUserIds: string[] | undefined;

    if (viewerId) {
      const following = await userRepository.getFollowing(viewerId);
      targetUserIds = following.map((f: any) => f.following?.id || f.followingId);
      targetUserIds.push(viewerId); // Include self
    }

    const stories = await storyRepository.getActiveStories(viewerId, targetUserIds);

    // Group stories by author
    const groups: Record<string, { author: any; stories: StoryItem[] }> = {};

    stories.forEach((story: any) => {
      const authorObj = story.author?.toObject ? story.author.toObject() : story.author || {};
      const authorId = (authorObj._id || authorObj.id || story.author || '').toString();

      if (!groups[authorId]) {
        groups[authorId] = {
          author: {
            id: authorId,
            username: authorObj.username || 'user',
            name: authorObj.name || authorObj.username || 'User',
            avatarUrl: authorObj.avatarUrl || null,
          },
          stories: [],
        };
      }

      const viewers = story.viewers || [];
      const isViewed = viewerId
        ? viewers.some((v: any) => (v.user?._id || v.user)?.toString() === viewerId)
        : false;

      groups[authorId].stories.push({
        id: story._id ? story._id.toString() : story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType || 'IMAGE',
        duration: story.duration || 15,
        caption: story.caption || null,
        author: groups[authorId].author,
        expiresAt: story.expiresAt ? new Date(story.expiresAt).toISOString() : new Date().toISOString(),
        createdAt: story.createdAt ? new Date(story.createdAt).toISOString() : new Date().toISOString(),
        isViewed,
        viewersCount: viewers.length,
      });
    });

    const trays: StoryTrayItem[] = Object.values(groups).map((group) => {
      const hasUnseen = group.stories.some((s) => !s.isViewed);
      return {
        author: group.author,
        hasUnseen,
        stories: group.stories,
      };
    });

    // Sort: Tray with unseen stories first, self first if present
    trays.sort((a, b) => {
      if (viewerId && a.author.id === viewerId) return -1;
      if (viewerId && b.author.id === viewerId) return 1;
      return (b.hasUnseen ? 1 : 0) - (a.hasUnseen ? 1 : 0);
    });

    return trays;
  }

  async recordView(storyId: string, viewerId: string, reaction?: string) {
    const viewer = await userRepository.findById(viewerId);
    const isGhostMode = viewer?.profile?.ghostMode || false;

    await storyRepository.recordView(storyId, viewerId, isGhostMode, reaction);
    return { success: true, isGhostMode };
  }

  async getStoryViewers(storyId: string, authorId: string) {
    return storyRepository.getStoryViewers(storyId, authorId);
  }
}

export const storyService = new StoryService();
