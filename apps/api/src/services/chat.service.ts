import { chatRepository } from '../repositories/chat.repository';
import { streakRepository } from '../repositories/streak.repository';
import { ConversationItem, MessageItem } from '@swap/shared';

export class ChatService {
  async getOrCreateDirectConversation(userId: string, recipientId: string): Promise<ConversationItem> {
    const conv = await chatRepository.findOrCreateDirectConversation(userId, recipientId);
    return this.formatConversation(conv, userId);
  }

  async createGroupConversation(userId: string, participantIds: string[], title: string): Promise<ConversationItem> {
    const conv = await chatRepository.createGroupConversation(userId, participantIds, title);
    return this.formatConversation(conv, userId);
  }

  async getUserConversations(userId: string): Promise<ConversationItem[]> {
    const convs = await chatRepository.getUserConversations(userId);
    return Promise.all(convs.map((c) => this.formatConversation(c, userId)));
  }

  async getMessages(conversationId: string, cursor?: string, limit = 30) {
    const result = await chatRepository.getMessages(conversationId, cursor, limit);
    return {
      items: result.messages,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async sendMessage(senderId: string, data: any): Promise<MessageItem> {
    let conversationId = data.conversationId;

    if (!conversationId && data.recipientId) {
      const conv = await chatRepository.findOrCreateDirectConversation(senderId, data.recipientId);
      conversationId = conv.id;
    }

    const message = await chatRepository.createMessage({
      conversationId,
      senderId,
      type: data.type || 'TEXT',
      content: data.content,
      mediaUrl: data.mediaUrl,
      metadata: data.metadata || null,
    });

    if (data.recipientId) {
      await streakRepository.recordInteraction(senderId, data.recipientId);
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    return chatRepository.markAsRead(conversationId, userId);
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const added = await chatRepository.toggleReaction(messageId, userId, emoji);
    return { added, emoji };
  }

  async deleteMessage(messageId: string, userId: string) {
    return chatRepository.deleteMessage(messageId, userId);
  }

  private async formatConversation(conv: any, viewerId: string): Promise<ConversationItem> {
    const participants = (conv.participants || []).map((p: any) => {
      const u = p.user || {};
      return {
        id: (u._id || u.id || p.userId || '').toString(),
        username: u.username || 'user',
        name: u.name || u.profile?.name || u.username || 'User',
        avatarUrl: u.avatarUrl || u.profile?.avatarUrl || null,
      };
    });

    let streakWithPeer = 0;
    if (!conv.isGroup) {
      const peer = participants.find((p: any) => p.id !== viewerId);
      if (peer) {
        const streaks = await streakRepository.getUserStreaks(viewerId);
        const match = streaks.find((s) => s.user1.id === peer.id || s.user2.id === peer.id);
        if (match) {
          streakWithPeer = match.currentStreak;
        }
      }
    }

    return {
      id: (conv._id || conv.id).toString(),
      isGroup: !!conv.isGroup,
      title: conv.title || null,
      participants,
      lastMessage: conv.lastMessage || null,
      unreadCount: 0,
      streakWithPeer,
      updatedAt: conv.updatedAt ? new Date(conv.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const chatService = new ChatService();
