import { capsuleService } from '../src/services/capsule.service';
import { User, TimeCapsule } from '../src/models';

describe('Time Capsule Posts Tests', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'alex@swap.app',
      username: 'alex_swap',
      name: 'Alex',
      passwordHash: 'hashed',
    });
    userId = user._id.toString();
  });

  it('should create a locked time capsule post for a future date', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const capsule = await capsuleService.createCapsule(userId, {
      title: 'Swap 3.0 Roadmap Leaks',
      caption: 'Super confidential feature ideas for 2027!',
      mediaUrl: 'https://images.unsplash.com/capsule.png',
      mediaType: 'IMAGE',
      unlocksAt: futureDate,
    });

    expect(capsule.id).toBeDefined();
    expect(capsule.title).toBe('Swap 3.0 Roadmap Leaks');
    expect(capsule.isUnlocked).toBe(false);
  });

  it('should mask confidential content and media URL when capsule is still locked', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await capsuleService.createCapsule(userId, {
      title: 'Swap 3.0 Roadmap Leaks',
      caption: 'Super confidential feature ideas for 2027!',
      mediaUrl: 'https://images.unsplash.com/capsule.png',
      mediaType: 'IMAGE',
      unlocksAt: futureDate,
    });

    const list = await capsuleService.getCapsules(userId);
    const futureCapsule = list.find((c) => c.title === 'Swap 3.0 Roadmap Leaks');

    expect(futureCapsule).toBeDefined();
    expect(futureCapsule!.isUnlocked).toBe(false);
    expect(futureCapsule!.mediaUrl).toBeNull();
    expect(futureCapsule!.caption).toContain('Locked');
  });

  it('should reveal content when unlock date is in the past', async () => {
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();

    await capsuleService.createCapsule(userId, {
      title: 'Unlocked Memories',
      caption: 'Open sesame!',
      mediaUrl: 'https://images.unsplash.com/unlocked.jpg',
      unlocksAt: pastDate,
    });

    const list = await capsuleService.getCapsules(userId);
    const unlockedCapsule = list.find((c) => c.title === 'Unlocked Memories');

    expect(unlockedCapsule).toBeDefined();
    expect(unlockedCapsule!.isUnlocked).toBe(true);
    expect(unlockedCapsule!.caption).toBe('Open sesame!');
    expect(unlockedCapsule!.mediaUrl).toBe('https://images.unsplash.com/unlocked.jpg');
  });
});
