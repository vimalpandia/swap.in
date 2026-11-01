import mongoose, { Schema, Document, Types } from 'mongoose';
import { MediaType } from '@swap/shared';

export interface ITimeCapsule extends Document {
  author: Types.ObjectId;
  recipient?: Types.ObjectId | null;
  title: string;
  caption?: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  unlocksAt: Date;
  isUnlocked: boolean;
  unlockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TimeCapsuleSchema = new Schema<ITimeCapsule>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    title: { type: String, required: true, maxlength: 200 },
    caption: { type: String, default: null, maxlength: 1000 },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: null },
    unlocksAt: { type: Date, required: true, index: true },
    isUnlocked: { type: Boolean, default: false, index: true },
    unlockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TimeCapsuleSchema.index({ unlocksAt: 1, isUnlocked: 1 });
TimeCapsuleSchema.index({ author: 1, createdAt: -1 });

export const TimeCapsule =
  mongoose.models.TimeCapsule || mongoose.model<ITimeCapsule>('TimeCapsule', TimeCapsuleSchema);

