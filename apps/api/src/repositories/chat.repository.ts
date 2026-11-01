import { Conversation, Message, IConversation, IMessage, User } from '../models';
import { MessageType, MessageItem, ConversationItem } from '@swap/shared';
import { Types } from 'mongoose';

function mapMessageToItem(m: any): MessageItem {
  const senderObj = m.sender?.toObject ? m.sender.toObject() : m.sender || {};
  const reactionsMap: Record<string, string[]> = {};

  if (Array.isArray(m.reactions)) {
    for (const r of m.reactions) {
      if (!reactionsMap[r.emoji]) reactionsMap[r.emoji] = [];
      const uId = (r.user?._id || r.user || '').toString();
      if (uId) reactionsMap[r.emoji].push(uId);
    }
  }

  return {
    id: m._id ? m._id.toString() : m.id,
    conversationId: (m.conversation?._id || m.conversation || '').toString(),
    sender: {
      id: (senderObj._id || senderObj.id || m.sender || '').toString(),
      username: senderObj.username || 'user',
      name: senderObj.name || senderObj.username || 'User',
      avatarUrl: senderObj.avatarUrl || null,
    },
    type: m.type || 'TEXT',
    content: m.isDeleted ? 'This message was deleted' : m.content || '',
    mediaUrl: m.isDeleted ? null : m.mediaUrl || null,
    isDeleted: !!m.isDeleted,
    readBy: (m.readBy || []).map((id: any) => id.toString()),
    reactions: reactionsMap,
    metadata: m.metadata || null,
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class ChatRepository {
  async findOrCreateDirectConversation(user1Id: string, user2Id: string) {
    const u1 = new Types.ObjectId(user1Id);
    const u2 = new Types.ObjectId(user2Id);

    const existing = await Conversation.findOne({
      isGroup: false,
      'participants.user': { $all: [u1, u2] },
    }).populate('participants.user');

    if (existing) {
      return {
        ...existing.toObject(),
        id: existing._id.toString(),
      };
    }

    const created = await Conversation.create({
      isGroup: false,
      participants: [
        { user: u1, lastReadAt: new Date(), joinedAt: new Date() },
        { user: u2, lastReadAt: new Date(), joinedAt: new Date() },
      ],
    });

    const populated = await Conversation.findById(created._id).populate('participants.user');
    return {
      ...populated.toObject(),
      id: populated._id.toString(),
    };
  }

  async createGroupConversation(creatorId: string, participantIds: string[], title: string) {
    const allUserIds = Array.from(new Set([creatorId, ...participantIds])).map(
      (id) => new Types.ObjectId(id)
    );

    const created = await Conversation.create({
      isGroup: true,
      title,
      participants: allUserIds.map((u) => ({
        user: u,
        lastReadAt: new Date(),
        joinedAt: new Date(),
      })),
    });

    const populated = await Conversation.findById(created._id).populate('participants.user');
    return {
      ...populated.toObject(),
      id: populated._id.toString(),
    };
  }

  async getUserConversations(userId: string) {
    const uId = new Types.ObjectId(userId);
    const conversations = await Conversation.find({
      'participants.user': uId,
    })
      .sort({ updatedAt: -1 })
      .populate('participants.user')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender' },
      });

    return conversations.map((c: any) => {
      const obj = c.toObject();
      const myParticipant = obj.participants.find(
        (p: any) => (p.user?._id || p.user)?.toString() === userId
      );
      return {
        ...obj,
        id: obj._id.toString(),
        lastMessage: obj.lastMessage ? mapMessageToItem(obj.lastMessage) : null,
        lastReadAt: myParticipant?.lastReadAt || null,
      };
    });
  }

  async getMessages(conversationId: string, cursor?: string, limit = 30) {
    const query: any = { conversation: new Types.ObjectId(conversationId) };

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('sender');

    let nextCursor: string | null = null;
    let hasMore = false;

    if (messages.length > limit) {
      hasMore = true;
      messages.pop();
      nextCursor = messages[messages.length - 1]?._id.toString() || null;
    }

    // Return in chronological order
    const mapped = messages.map(mapMessageToItem).reverse();

    return {
      messages: mapped,
      nextCursor,
      hasMore,
    };
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string | null;
    metadata?: any;
  }) {
    const message = await Message.create({
      conversation: new Types.ObjectId(data.conversationId),
      sender: new Types.ObjectId(data.senderId),
      type: data.type,
      content: data.content,
      mediaUrl: data.mediaUrl || null,
      metadata: data.metadata || null,
      readBy: [new Types.ObjectId(data.senderId)],
      reactions: [],
    });

    await Conversation.findByIdAndUpdate(data.conversationId, {
      $set: { updatedAt: new Date(), lastMessage: message._id },
    });

    const populated = await Message.findById(message._id).populate('sender');
    return mapMessageToItem(populated);
  }

  async markAsRead(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) return;
    await Conversation.updateOne(
      { _id: conversationId, 'participants.user': new Types.ObjectId(userId) },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    );
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: new Types.ObjectId(userId) } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } }
    );
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(userId)) return false;
    const uId = new Types.ObjectId(userId);

    const message = await Message.findById(messageId);
    if (!message) return false;

    const existingIndex = message.reactions.findIndex(
      (r: any) => r.user.toString() === userId && r.emoji === emoji
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
      await message.save();
      return false; // Removed
    } else {
      message.reactions.push({ user: uId, emoji });
      await message.save();
      return true; // Added
    }
  }

  async deleteMessage(messageId: string, senderId: string) {
    if (!Types.ObjectId.isValid(messageId)) return false;
    const res = await Message.updateOne(
      { _id: messageId, sender: senderId },
      { $set: { isDeleted: true, content: 'This message was deleted' } }
    );
    return res.modifiedCount > 0;
  }
}

export const chatRepository = new ChatRepository();
