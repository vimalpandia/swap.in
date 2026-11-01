import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWasteTimeLog extends Document {
  user: Types.ObjectId;
  reel?: Types.ObjectId | null;
  watchDurationSeconds: number;
  date: string; // YYYY-MM-DD
  createdAt: Date;
}

const WasteTimeLogSchema = new Schema<IWasteTimeLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    watchDurationSeconds: { type: Number, required: true },
    date: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WasteTimeLogSchema.index({ user: 1, date: 1 });

export const WasteTimeLog =
  mongoose.models.WasteTimeLog || mongoose.model<IWasteTimeLog>('WasteTimeLog', WasteTimeLogSchema);

