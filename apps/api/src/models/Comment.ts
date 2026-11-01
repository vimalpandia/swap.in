import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  author: Types.ObjectId;
  post?: Types.ObjectId | null;
  reel?: Types.ObjectId | null;
  parent?: Types.ObjectId | null;
  content: string;
  likesCount: number;
  replyCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', default: null, index: true },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    likesCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ reel: 1, createdAt: -1 });
CommentSchema.index({ parent: 1, createdAt: 1 });

export const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

