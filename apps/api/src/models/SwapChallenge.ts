import mongoose, { Schema, Document, Types } from 'mongoose';
import { SwapChallengeStatus } from '@swap/shared';

export interface ISwapChallenge extends Document {
  prompt: string;
  initiator: Types.ObjectId;
  recipient: Types.ObjectId;
  initiatorReel: Types.ObjectId;
  replyReel?: Types.ObjectId | null;
  status: SwapChallengeStatus;
  isDuet: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SwapChallengeSchema = new Schema<ISwapChallenge>(
  {
    prompt: { type: String, required: true, maxlength: 280 },
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    initiatorReel: { type: Schema.Types.ObjectId, ref: 'Reel', required: true },
    replyReel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED'],
      default: 'PENDING',
      index: true,
    },
    isDuet: { type: Boolean, default: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

SwapChallengeSchema.index({ recipient: 1, status: 1 });
SwapChallengeSchema.index({ initiator: 1, status: 1 });
SwapChallengeSchema.index({ createdAt: -1 });

export const SwapChallenge =
  mongoose.models.SwapChallenge || mongoose.model<ISwapChallenge>('SwapChallenge', SwapChallengeSchema);

