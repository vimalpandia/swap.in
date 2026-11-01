import { wasteTimeService } from '../src/services/wasteTime.service';
import { User, WasteTimeLog } from '../src/models';

describe('Time Wasted Meter & Focus Guard Tests', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'alex@swap.app',
      username: 'alex_swap',
      name: 'Alex Rivera',
      passwordHash: 'hash',
      focusGuardMinutes: 30,
    });
    userId = user._id.toString();
  });

  it('should log watch time for user', async () => {
    const log = await wasteTimeService.logWatchTime(userId, null, 1200); // 20 minutes
    expect(log).toBeDefined();
    expect(log?.watchDurationSeconds).toBe(1200);
  });

  it('should calculate today minutes and award Novice or Bronze badge', async () => {
    await wasteTimeService.logWatchTime(userId, null, 1200); // 20 minutes
    const dashboard = await wasteTimeService.getDashboard(userId);
    expect(dashboard.todayMinutes).toBe(20);
    expect(dashboard.currentBadge.name).toBe('Bronze Procrastinator');
  });

  it('should upgrade badge to Golden Idler after reaching 90+ minutes', async () => {
    await wasteTimeService.logWatchTime(userId, null, 6000); // 100 minutes

    const dashboard = await wasteTimeService.getDashboard(userId);
    expect(dashboard.todayMinutes).toBe(100);
    expect(dashboard.currentBadge.level).toBe('GOLDEN_IDLER');
    expect(dashboard.currentBadge.name).toBe('Golden Idler');
  });

  it('should trigger Focus Guard alert when today time exceeds focus threshold (30 min)', async () => {
    await wasteTimeService.logWatchTime(userId, null, 2400); // 40 minutes

    const status = await wasteTimeService.getFocusGuardStatus(userId);
    expect(status.focusGuardMinutes).toBe(30);
    expect(status.todayMinutes).toBeGreaterThanOrEqual(30);
    expect(status.shouldTriggerGuard).toBe(true);
    expect(status.message).toContain('Take a mindful breath');
  });

  it('should generate 7-day daily history for chart visualization', async () => {
    await wasteTimeService.logWatchTime(userId, null, 6000); // 100 minutes
    const dashboard = await wasteTimeService.getDashboard(userId);
    expect(dashboard.dailyHistory.length).toBe(7);
    expect(dashboard.weeklyTotalMinutes).toBeGreaterThanOrEqual(100);
  });
});
