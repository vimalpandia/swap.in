import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId;
  post?: Types.ObjectId | null;
  reel?: Types.ObjectId | null;
  comment?: Types.ObjectId | null;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true, $type: 'objectId' } } }
);
LikeSchema.index(
  { user: 1, reel: 1 },
  { unique: true, partialFilterExpression: { reel: { $exists: true, $type: 'objectId' } } }
);
LikeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true, $type: 'objectId' } } }
);
LikeSchema.index({ post: 1 });
LikeSchema.index({ reel: 1 });
LikeSchema.index({ comment: 1 });

export const Like = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);
