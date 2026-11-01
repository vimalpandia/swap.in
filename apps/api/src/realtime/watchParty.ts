import { redisClient } from '../config/redis';

export interface WatchPartyState {
  roomId: string;
  reelId: string;
  hostId: string;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: number;
}

export class WatchPartyManager {
  private rooms: Map<string, WatchPartyState> = new Map();

  async getSession(roomId: string): Promise<WatchPartyState | null> {
    const memory = this.rooms.get(roomId);
    if (memory) return memory;

    try {
      const data = await redisClient.get(`watch_party:${roomId}`);
      if (data) {
        const parsed = JSON.parse(data);
        this.rooms.set(roomId, parsed);
        return parsed;
      }
    } catch {
      // Resilient
    }
    return null;
  }

  async saveSession(state: WatchPartyState) {
    this.rooms.set(state.roomId, state);
    try {
      await redisClient.setex(`watch_party:${state.roomId}`, 3600, JSON.stringify(state));
    } catch {
      // Resilient
    }
  }

  async updatePlayback(roomId: string, currentTime: number, isPlaying: boolean): Promise<WatchPartyState | null> {
    const session = await this.getSession(roomId);
    if (!session) return null;

    session.currentTime = currentTime;
    session.isPlaying = isPlaying;
    session.updatedAt = Date.now();

    await this.saveSession(session);
    return session;
  }

  async changeReel(roomId: string, reelId: string): Promise<WatchPartyState | null> {
    const session = await this.getSession(roomId);
    if (!session) return null;

    session.reelId = reelId;
    session.currentTime = 0;
    session.isPlaying = true;
    session.updatedAt = Date.now();

    await this.saveSession(session);
    return session;
  }
}

export const watchPartyManager = new WatchPartyManager();

