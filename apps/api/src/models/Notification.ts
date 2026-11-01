import mongoose, { Schema, Document, Types } from 'mongoose';
import { NotificationType } from '@swap/shared';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;
  post?: Types.ObjectId | null;
  reel?: Types.ObjectId | null;
  comment?: Types.ObjectId | null;
  capsule?: Types.ObjectId | null;
  swapChallenge?: Types.ObjectId | null;
  read: boolean;
  previewText?: string | null;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'LIKE',
        'COMMENT',
        'FOLLOW',
        'MENTION',
        'TIME_CAPSULE_UNLOCKED',
        'COLLAB_INVITE',
        'COLLAB_ACCEPTED',
        'STREAK_ALERT',
        'SWAP_CHALLENGE_INVITE',
        'SWAP_CHALLENGE_REPLIED',
        'SWAP_DAY_MATCH',
      ],
      required: true,
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    capsule: { type: Schema.Types.ObjectId, ref: 'TimeCapsule', default: null },
    swapChallenge: { type: Schema.Types.ObjectId, ref: 'SwapChallenge', default: null },
    read: { type: Boolean, default: false },
    previewText: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

