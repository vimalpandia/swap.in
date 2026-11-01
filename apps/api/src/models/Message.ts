import mongoose, { Schema, Document, Types } from 'mongoose';
import { MessageType } from '@swap/shared';

export interface IMessageReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  type: MessageType;
  content: string;
  mediaUrl?: string | null;
  metadata?: Record<string, any> | null;
  isDeleted: boolean;
  readBy: Types.ObjectId[];
  reactions: IMessageReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageReactionSchema = new Schema<IMessageReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'SYSTEM', 'WATCH_PARTY_INVITE', 'SWAP_CHALLENGE_INVITE'],
      default: 'TEXT',
    },
    content: { type: String, default: '' },
    mediaUrl: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
    isDeleted: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions: [MessageReactionSchema],
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

