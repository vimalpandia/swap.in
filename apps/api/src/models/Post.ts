import mongoose, { Schema, Document, Types } from 'mongoose';
import { MoodType, MediaType } from '@swap/shared';

export interface IPostMedia {
  url: string;
  type: MediaType;
  width?: number;
  height?: number;
  order: number;
}

export interface IPost extends Document {
  author: Types.ObjectId;
  caption?: string | null;
  location?: string | null;
  mood?: MoodType | null;
  media: IPostMedia[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  hashtags: string[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PostMediaSchema = new Schema<IPostMedia>(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    width: { type: Number },
    height: { type: Number },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    caption: { type: String, default: null, maxlength: 2200 },
    location: { type: String, default: null, maxlength: 100 },
    mood: { type: String, default: null },
    media: [PostMediaSchema],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    hashtags: [{ type: String, index: true }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound indexes for cursor-based feed & user profiles
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ mood: 1, createdAt: -1 });
PostSchema.index({ caption: 'text', location: 'text' });

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

