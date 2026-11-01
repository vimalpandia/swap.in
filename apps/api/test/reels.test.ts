import { reelService } from '../src/services/reel.service';
import { User, Reel } from '../src/models';

describe('Reels & Recommendation Engine Tests', () => {
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    const user1 = await User.create({
      email: 'creator@swap.app',
      username: 'creator_swap',
      name: 'Creator',
      passwordHash: 'hashed',
    });
    const user2 = await User.create({
      email: 'partner@swap.app',
      username: 'partner_swap',
      name: 'Partner',
      passwordHash: 'hashed',
    });
    user1Id = user1._id.toString();
    user2Id = user2._id.toString();
  });

  it('should create a Waste of Time reel with audio and mood', async () => {
    const reel = await reelService.createReel(user1Id, {
      caption: 'Midnight Tokyo Hyperlapse #swap',
      videoUrl: 'https://assets.mixkit.co/reels/tokyo.mp4',
      thumbnailUrl: 'https://images.unsplash.com/tokyo.jpg',
      duration: 15,
      audioName: 'Swap Synthwave - Lo-Fi',
      mood: 'CHILL',
    });

    expect(reel.id).toBeDefined();
    expect(reel.mood).toBe('CHILL');
    expect(reel.audioName).toBe('Swap Synthwave - Lo-Fi');
    expect(reel.author.username).toBe('creator_swap');
  });

  it('should rank reels feed with recommendation scoring', async () => {
    await reelService.createReel(user1Id, {
      caption: 'Reel 1 #swap',
      videoUrl: 'https://assets.mixkit.co/v1.mp4',
      thumbnailUrl: 'https://images.unsplash.com/t1.jpg',
      duration: 15,
      mood: 'CHILL',
    });

    const feed = await reelService.getReelsFeed({ mood: 'CHILL' });
    expect(feed.items).toBeDefined();
    expect(Array.isArray(feed.items)).toBe(true);
    expect(feed.items.length).toBeGreaterThan(0);
    expect(feed.items[0].recommendationScore).toBeGreaterThanOrEqual(0);
  });

  it('should increment view count and log watch time', async () => {
    const reel = await reelService.createReel(user1Id, {
      caption: 'Watch time test',
      videoUrl: 'https://assets.mixkit.co/v2.mp4',
      thumbnailUrl: 'https://images.unsplash.com/t2.jpg',
      duration: 15,
    });

    const res = await reelService.logWatchTime(user1Id, reel.id, 12);
    expect(res.success).toBe(true);

    const updated = await Reel.findById(reel.id);
    expect(updated?.viewCount).toBe(1);
  });

  it('should support co-author collab invitation and response', async () => {
    const collabReel = await reelService.createReel(user1Id, {
      coAuthorId: user2Id,
      caption: 'Collab reel test',
      videoUrl: 'https://assets.mixkit.co/collab.mp4',
      thumbnailUrl: 'https://images.unsplash.com/collab.jpg',
      duration: 20,
    });

    expect(collabReel.collabStatus).toBe('PENDING');

    const accepted = await reelService.respondToCollab(user2Id, collabReel.id, true);
    expect(accepted.status).toBe('ACCEPTED');

    const updated = await Reel.findById(collabReel.id);
    expect(updated?.collabStatus).toBe('ACCEPTED');
  });
});
