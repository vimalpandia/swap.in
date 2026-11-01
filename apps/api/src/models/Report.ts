import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  reportedUser?: Types.ObjectId | null;
  reportedPost?: Types.ObjectId | null;
  reportedReel?: Types.ObjectId | null;
  reportedComment?: Types.ObjectId | null;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reportedPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    reportedReel: { type: Schema.Types.ObjectId, ref: 'Reel', default: null },
    reportedComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

