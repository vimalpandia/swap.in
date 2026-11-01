import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED'], default: 'ACCEPTED' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1, status: 1 });
FollowSchema.index({ follower: 1, status: 1 });

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);

