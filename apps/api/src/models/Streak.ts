import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStreak extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastInteractionAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>(
  {
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentStreak: { type: Number, default: 1 },
    longestStreak: { type: Number, default: 1 },
    lastInteractionAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

StreakSchema.index({ user1: 1, user2: 1 }, { unique: true });

export const Streak = mongoose.models.Streak || mongoose.model<IStreak>('Streak', StreakSchema);

