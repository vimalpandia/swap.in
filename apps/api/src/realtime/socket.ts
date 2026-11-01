import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { redisClient } from '../config/redis';
import { watchPartyManager } from './watchParty';
import { logger } from '../config/logger';

export function setupSocketServer(io: Server) {
  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error: Token required'));
      }

      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch (err: any) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    const userId = user.userId;
    logger.info(`Socket connected: ${user.username} (${userId})`);

    // Add to personal user room for targeted notifications
    socket.join(`user:${userId}`);

    // Mark online in Redis
    try {
      await redisClient.sadd('online_users', userId);
      io.emit('presence_update', { userId, status: 'ONLINE' });
    } catch {
      // Resilient
    }

    // Join Conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing Indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        username: user.username,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // Realtime Direct Chat Send
    socket.on('send_message', (payload: any) => {
      io.to(`conversation:${payload.conversationId}`).emit('new_message', payload);
    });

    // Message Reaction
    socket.on('message_reaction', (payload: any) => {
      io.to(`conversation:${payload.conversationId}`).emit('reaction_updated', payload);
    });

    // Watch Party Sync Events
    socket.on('join_watch_party', async ({ roomId, reelId }: { roomId: string; reelId: string }) => {
      socket.join(`watch_party:${roomId}`);

      let session = await watchPartyManager.getSession(roomId);
      if (!session) {
        session = {
          roomId,
          reelId,
          hostId: userId,
          currentTime: 0,
          isPlaying: true,
          updatedAt: Date.now(),
        };
        await watchPartyManager.saveSession(session);
      }

      socket.emit('watch_party_state', session);
      socket.to(`watch_party:${roomId}`).emit('user_joined_party', {
        userId,
        username: user.username,
      });
    });

    socket.on('watch_party_sync', async ({ roomId, currentTime, isPlaying }: any) => {
      const updated = await watchPartyManager.updatePlayback(roomId, currentTime, isPlaying);
      if (updated) {
        socket.to(`watch_party:${roomId}`).emit('watch_party_state', updated);
      }
    });

    socket.on('watch_party_change_reel', async ({ roomId, reelId }: any) => {
      const updated = await watchPartyManager.changeReel(roomId, reelId);
      if (updated) {
        io.to(`watch_party:${roomId}`).emit('watch_party_state', updated);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${user.username}`);
      try {
        await redisClient.srem('online_users', userId);
        io.emit('presence_update', { userId, status: 'OFFLINE' });
      } catch {
        // Resilient
      }
    });
  });
}

