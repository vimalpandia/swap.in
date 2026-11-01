import { WasteTimeLog, IWasteTimeLog } from '../models';
import { BADGE_LEVELS, WasteTimeDashboard, WasteTimeDailyStats } from '@swap/shared';
import { Types } from 'mongoose';

export class WasteTimeRepository {
  async logTime(userId: string, reelId: string | null, durationSeconds: number) {
    if (!Types.ObjectId.isValid(userId)) return null;
    const today = new Date().toISOString().split('T')[0];

    return WasteTimeLog.create({
      user: new Types.ObjectId(userId),
      reel: reelId && Types.ObjectId.isValid(reelId) ? new Types.ObjectId(reelId) : null,
      watchDurationSeconds: durationSeconds,
      date: today,
    });
  }

  async getDashboard(userId: string): Promise<WasteTimeDashboard> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const sevenDaysAgoDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().split('T')[0];

    let logs: IWasteTimeLog[] = [];
    if (Types.ObjectId.isValid(userId)) {
      logs = await WasteTimeLog.find({
        user: new Types.ObjectId(userId),
        date: { $gte: sevenDaysAgoStr },
      });
    }

    let todaySeconds = 0;
    let todayReelsCount = 0;
    let weeklySeconds = 0;

    const dailyMap: Record<string, { seconds: number; count: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      dailyMap[dStr] = { seconds: 0, count: 0 };
    }

    logs.forEach((log) => {
      weeklySeconds += log.watchDurationSeconds;
      if (log.date === today) {
        todaySeconds += log.watchDurationSeconds;
        todayReelsCount++;
      }
      if (dailyMap[log.date]) {
        dailyMap[log.date].seconds += log.watchDurationSeconds;
        dailyMap[log.date].count += 1;
      }
    });

    const todayMinutes = Math.floor(todaySeconds / 60);
    const weeklyTotalMinutes = Math.floor(weeklySeconds / 60);

    let currentBadge = {
      level: 'NOVICE_SCROLLER',
      name: 'Novice Scroller',
      icon: '🌱',
      minMinutes: 0,
    };
    let nextBadge = null;

    for (let i = 0; i < BADGE_LEVELS.length; i++) {
      const badge = BADGE_LEVELS[i];
      if (todayMinutes >= badge.minMinutes) {
        currentBadge = badge;
      } else {
        nextBadge = {
          ...badge,
          remainingMinutes: badge.minMinutes - todayMinutes,
        };
        break;
      }
    }

    const dailyHistory: WasteTimeDailyStats[] = Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date,
        totalMinutes: Math.floor(dailyMap[date].seconds / 60),
        reelsWatchedCount: dailyMap[date].count,
      }));

    return {
      todayMinutes,
      weeklyTotalMinutes,
      reelsWatchedToday: todayReelsCount,
      currentBadge,
      nextBadge,
      dailyHistory,
    };
  }
}

export const wasteTimeRepository = new WasteTimeRepository();
