import { streakService } from '../src/services/streak.service';
import { User, Streak } from '../src/models';

describe('Streaks Service Tests', () => {
  let userAId: string;
  let userBId: string;

  beforeEach(async () => {
    const uA = await User.create({ email: 'ua@swap.app', username: 'user_a', name: 'User A', passwordHash: 'hash' });
    const uB = await User.create({ email: 'ub@swap.app', username: 'user_b', name: 'User B', passwordHash: 'hash' });
    userAId = uA._id.toString();
    userBId = uB._id.toString();
  });

  it('should initialize a new streak between two users on their first interaction', async () => {
    const streak = await streakService.recordInteraction(userAId, userBId);
    expect(streak).toBeDefined();
    expect(streak?.currentStreak).toBe(1);
  });

  it('should increment streak when users interact after cooling period', async () => {
    // Create existing streak with last interaction 8 hours ago
    const u1 = userAId < userBId ? userAId : userBId;
    const u2 = userAId < userBId ? userBId : userAId;

    await Streak.create({
      user1: u1,
      user2: u2,
      currentStreak: 1,
      longestStreak: 1,
      lastInteractionAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000),
    });

    const updated = await streakService.recordInteraction(userAId, userBId);
    expect(updated?.currentStreak).toBe(2);
    expect(updated?.longestStreak).toBe(2);
  });

  it('should detect when streak is expiring soon (less than 4 hours remaining)', async () => {
    const u1 = userAId < userBId ? userAId : userBId;
    const u2 = userAId < userBId ? userBId : userAId;

    await Streak.create({
      user1: u1,
      user2: u2,
      currentStreak: 5,
      longestStreak: 10,
      lastInteractionAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours left
    });

    const streaks = await streakService.getUserStreaks(userAId);
    expect(streaks.length).toBe(1);
    expect(streaks[0].isExpiringSoon).toBe(true);
  });
});
