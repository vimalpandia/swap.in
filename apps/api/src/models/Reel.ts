import mongoose, { Schema, Document, Types } from 'mongoose';
import { MoodType, CollabStatus } from '@swap/shared';

export interface IReel extends Document {
  author: Types.ObjectId;
  coAuthor?: Types.ObjectId | null;
  collabStatus?: CollabStatus | null;
  caption?: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  hlsPlaylistUrl?: string | null;
  duration: number;
  audioName: string;
  mood?: MoodType | null;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  hashtags: string[];
  duetParentReel?: Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReelSchema = new Schema<IReel>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coAuthor: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    collabStatus: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: null },
    caption: { type: String, default: null, maxlength: 2200 },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    hlsPlaylistUrl: { type: String, default: null },
    duration: { type: Number, required: true },
    audioName: { type: String, default: 'Original Audio' },
    mood: { type: String, default: null },
    viewCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    hashtags: [{ type: String, index: true }],
    duetParentReel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ReelSchema.index({ author: 1, createdAt: -1 });
ReelSchema.index({ createdAt: -1 });
ReelSchema.index({ mood: 1, createdAt: -1 });
ReelSchema.index({ duetParentReel: 1 });

export const Reel = mongoose.models.Reel || mongoose.model<IReel>('Reel', ReelSchema);

