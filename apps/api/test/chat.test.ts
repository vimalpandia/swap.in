import { chatService } from '../src/services/chat.service';
import { User, Conversation, Message } from '../src/models';

describe('Chat & Realtime Service Tests', () => {
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;

  beforeEach(async () => {
    const u1 = await User.create({ email: 'u1@swap.app', username: 'user1', name: 'User 1', passwordHash: 'hash' });
    const u2 = await User.create({ email: 'u2@swap.app', username: 'user2', name: 'User 2', passwordHash: 'hash' });
    const u3 = await User.create({ email: 'u3@swap.app', username: 'user3', name: 'User 3', passwordHash: 'hash' });
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();
    user3Id = u3._id.toString();
  });

  it('should create direct 1-to-1 conversation', async () => {
    const conv = await chatService.getOrCreateDirectConversation(user1Id, user2Id);
    expect(conv.id).toBeDefined();
    expect(conv.isGroup).toBe(false);
    expect(conv.participants.length).toBe(2);
  });

  it('should create a group conversation with title', async () => {
    const group = await chatService.createGroupConversation(user1Id, [user2Id, user3Id], 'Swap Dev Crew');
    expect(group.id).toBeDefined();
    expect(group.isGroup).toBe(true);
    expect(group.title).toBe('Swap Dev Crew');
    expect(group.participants.length).toBe(3);
  });

  it('should send a Watch Party invite message with metadata', async () => {
    const conv = await chatService.getOrCreateDirectConversation(user1Id, user2Id);
    const msg = await chatService.sendMessage(user1Id, {
      conversationId: conv.id,
      type: 'WATCH_PARTY_INVITE',
      content: 'Join my Watch Party!',
      metadata: { roomId: 'room-123', reelId: 'reel-999' },
    });

    expect(msg.type).toBe('WATCH_PARTY_INVITE');
    expect(msg.metadata?.roomId).toBe('room-123');
  });

  it('should toggle an emoji reaction on a message', async () => {
    const conv = await chatService.getOrCreateDirectConversation(user1Id, user2Id);
    const msg = await chatService.sendMessage(user1Id, {
      conversationId: conv.id,
      type: 'TEXT',
      content: 'Swap vibes are live!',
    });

    const addReaction = await chatService.toggleReaction(msg.id, user2Id, '🔥');
    expect(addReaction.emoji).toBe('🔥');
    expect(addReaction.added).toBe(true);

    const removeReaction = await chatService.toggleReaction(msg.id, user2Id, '🔥');
    expect(removeReaction.added).toBe(false);
  });

  it('should soft delete a message', async () => {
    const conv = await chatService.getOrCreateDirectConversation(user1Id, user2Id);
    const msg = await chatService.sendMessage(user1Id, {
      conversationId: conv.id,
      type: 'TEXT',
      content: 'Secret message',
    });

    const result = await chatService.deleteMessage(msg.id, user1Id);
    expect(result).toBe(true);

    const updated = await Message.findById(msg.id);
    expect(updated?.isDeleted).toBe(true);
  });
});
