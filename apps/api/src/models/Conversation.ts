import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IParticipant {
  user: Types.ObjectId;
  lastReadAt: Date;
  joinedAt: Date;
}

export interface IConversation extends Document {
  isGroup: boolean;
  title?: string | null;
  participants: IParticipant[];
  lastMessage?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastReadAt: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    isGroup: { type: Boolean, default: false },
    title: { type: String, default: null },
    participants: [ParticipantSchema],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

ConversationSchema.index({ 'participants.user': 1, updatedAt: -1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

