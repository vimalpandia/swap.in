import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWatchSession extends Document {
  roomId: string;
  reel: Types.ObjectId;
  host: Types.ObjectId;
  participants: Types.ObjectId[];
  isPlaying: boolean;
  currentTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const WatchSessionSchema = new Schema<IWatchSession>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', required: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WatchSession =
  mongoose.models.WatchSession || mongoose.model<IWatchSession>('WatchSession', WatchSessionSchema);

