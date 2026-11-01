import { Story, IStory, User } from '../models';
import { MediaType, StoryItem, StoryTrayItem } from '@swap/shared';
import { Types } from 'mongoose';

function mapStoryToItem(story: any, viewerId?: string): StoryItem {
  const authorObj = story.author?.toObject ? story.author.toObject() : story.author || {};
  const viewers = story.viewers || [];
  const isViewed = viewerId
    ? viewers.some((v: any) => (v.user?._id || v.user)?.toString() === viewerId)
    : false;

  return {
    id: story._id ? story._id.toString() : story.id,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType || 'IMAGE',
    duration: story.duration || 15,
    caption: story.caption || null,
    author: {
      id: (authorObj._id || authorObj.id || story.author || '').toString(),
      username: authorObj.username || 'user',
      name: authorObj.name || authorObj.username || 'User',
      avatarUrl: authorObj.avatarUrl || null,
    },
    expiresAt: story.expiresAt ? new Date(story.expiresAt).toISOString() : new Date().toISOString(),
    createdAt: story.createdAt ? new Date(story.createdAt).toISOString() : new Date().toISOString(),
    isViewed,
    viewersCount: viewers.length,
  };
}

export class StoryRepository {
  async create(data: {
    authorId: string;
    mediaUrl: string;
    mediaType: MediaType;
    duration?: number;
    caption?: string | null;
    expiresAt: Date;
  }): Promise<StoryItem> {
    const story = await Story.create({
      author: new Types.ObjectId(data.authorId),
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      duration: data.duration || 15,
      caption: data.caption,
      expiresAt: data.expiresAt,
      viewers: [],
    });

    const populated = await Story.findById(story._id).populate('author');
    return mapStoryToItem(populated);
  }

  async getActiveStories(viewerId?: string, userIds?: string[]): Promise<any[]> {
    const now = new Date();
    const query: any = {
      expiresAt: { $gt: now },
      isArchived: false,
    };

    if (userIds && userIds.length > 0) {
      query.author = { $in: userIds.map((id) => new Types.ObjectId(id)) };
    }

    const stories = await Story.find(query)
      .sort({ createdAt: 1 })
      .populate('author')
      .populate('viewers.user');

    return stories;
  }

  async recordView(storyId: string, viewerId: string, isGhostMode = false, reaction?: string) {
    if (isGhostMode) {
      // In Ghost Mode, leave zero footprint
      return null;
    }
    if (!Types.ObjectId.isValid(storyId) || !Types.ObjectId.isValid(viewerId)) return null;

    const vId = new Types.ObjectId(viewerId);
    // Remove if already viewed so we update reaction and viewedAt
    await Story.updateOne(
      { _id: storyId },
      { $pull: { viewers: { user: vId } } }
    );

    return Story.findByIdAndUpdate(
      storyId,
      {
        $push: {
          viewers: {
            user: vId,
            viewedAt: new Date(),
            reaction: reaction || null,
          },
        },
      },
      { new: true }
    );
  }

  async getStoryViewers(storyId: string, authorId: string) {
    if (!Types.ObjectId.isValid(storyId)) return [];
    const story = await Story.findOne({ _id: storyId, author: authorId }).populate(
      'viewers.user'
    );
    if (!story) return [];

    return (story.viewers || []).map((v: any) => {
      const u = v.user || {};
      return {
        user: {
          id: (u._id || u.id || '').toString(),
          username: u.username || 'user',
          name: u.name || u.username || 'User',
          avatarUrl: u.avatarUrl || null,
        },
        viewedAt: v.viewedAt ? new Date(v.viewedAt).toISOString() : new Date().toISOString(),
        reaction: v.reaction || null,
      };
    });
  }

  async archiveExpiredStories() {
    const now = new Date();
    return Story.updateMany(
      { expiresAt: { $lte: now }, isArchived: false },
      { $set: { isArchived: true } }
    );
  }
}

export const storyRepository = new StoryRepository();
