import mongoose, { Schema, Document } from 'mongoose';

export interface IHashtag extends Document {
  name: string;
  postCount: number;
  reelCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HashtagSchema = new Schema<IHashtag>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    postCount: { type: Number, default: 0 },
    reelCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Hashtag = mongoose.models.Hashtag || mongoose.model<IHashtag>('Hashtag', HashtagSchema);

