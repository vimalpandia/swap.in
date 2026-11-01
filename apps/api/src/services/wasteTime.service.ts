import { wasteTimeRepository } from '../repositories/wasteTime.repository';
import { userRepository } from '../repositories/user.repository';
import { WasteTimeDashboard } from '@swap/shared';

export class WasteTimeService {
  async logWatchTime(userId: string, reelId: string | null, seconds: number) {
    return wasteTimeRepository.logTime(userId, reelId, seconds);
  }

  async getDashboard(userId: string): Promise<WasteTimeDashboard> {
    return wasteTimeRepository.getDashboard(userId);
  }

  async getFocusGuardStatus(userId: string) {
    const user = await userRepository.findById(userId);
    const focusGuardMinutes = user?.profile?.focusGuardMinutes || 30;
    const dashboard = await wasteTimeRepository.getDashboard(userId);

    const shouldTriggerGuard =
      focusGuardMinutes > 0 && dashboard.todayMinutes >= focusGuardMinutes;

    return {
      focusGuardMinutes,
      todayMinutes: dashboard.todayMinutes,
      shouldTriggerGuard,
      message: `You've been scrolling for ${dashboard.todayMinutes} minutes today. Take a mindful breath or snooze?`,
    };
  }
}

export const wasteTimeService = new WasteTimeService();
