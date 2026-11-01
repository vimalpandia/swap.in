import { streakRepository } from '../repositories/streak.repository';
import { StreakItem } from '@swap/shared';

export class StreakService {
  async recordInteraction(userIdA: string, userIdB: string) {
    return streakRepository.recordInteraction(userIdA, userIdB);
  }

  async getUserStreaks(userId: string): Promise<StreakItem[]> {
    return streakRepository.getUserStreaks(userId);
  }
}

export const streakService = new StreakService();
