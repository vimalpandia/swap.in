import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISave extends Document {
  user: Types.ObjectId;
  post?: Types.ObjectId | null;
  reel?: Types.ObjectId | null;
  createdAt: Date;
}

const SaveSchema = new Schema<ISave>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SaveSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true, $type: 'objectId' } } }
);
SaveSchema.index(
  { user: 1, reel: 1 },
  { unique: true, partialFilterExpression: { reel: { $exists: true, $type: 'objectId' } } }
);
SaveSchema.index({ user: 1, createdAt: -1 });

export const Save = mongoose.models.Save || mongoose.model<ISave>('Save', SaveSchema);
