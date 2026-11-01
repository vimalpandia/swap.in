import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISwapDayMatch extends Document {
  date: string; // YYYY-MM-DD
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  user1VibeNote?: string | null;
  user2VibeNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SwapDayMatchSchema = new Schema<ISwapDayMatch>(
  {
    date: { type: String, required: true, index: true },
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    user1VibeNote: { type: String, default: null, maxlength: 280 },
    user2VibeNote: { type: String, default: null, maxlength: 280 },
  },
  { timestamps: true }
);

SwapDayMatchSchema.index({ date: 1, user1: 1 }, { unique: true });
SwapDayMatchSchema.index({ date: 1, user2: 1 }, { unique: true });

export const SwapDayMatch =
  mongoose.models.SwapDayMatch || mongoose.model<ISwapDayMatch>('SwapDayMatch', SwapDayMatchSchema);

