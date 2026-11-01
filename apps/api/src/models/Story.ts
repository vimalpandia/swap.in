import mongoose, { Schema, Document, Types } from 'mongoose';
import { MediaType } from '@swap/shared';

export interface IStoryViewer {
  user: Types.ObjectId;
  viewedAt: Date;
  reaction?: string | null;
}

export interface IStory extends Document {
  author: Types.ObjectId;
  mediaUrl: string;
  mediaType: MediaType;
  duration: number;
  caption?: string | null;
  viewers: IStoryViewer[];
  expiresAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoryViewerSchema = new Schema<IStoryViewer>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now },
    reaction: { type: String, default: null },
  },
  { _id: false }
);

const StorySchema = new Schema<IStory>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    duration: { type: Number, default: 15 },
    caption: { type: String, default: null, maxlength: 500 },
    viewers: [StoryViewerSchema],
    expiresAt: { type: Date, required: true, index: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index to automatically expire/remove stories after 24 hours (86400 seconds)
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
StorySchema.index({ author: 1, createdAt: -1 });

export const Story = mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

