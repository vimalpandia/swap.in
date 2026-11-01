import { swapService } from '../src/services/swap.service';
import { userService } from '../src/services/user.service';
import { User, Reel, SwapChallenge, SwapDayMatch, Follow } from '../src/models';

describe('Swap Signature Features Tests', () => {
  let user1Id: string;
  let user2Id: string;
  let reel1Id: string;
  let reel2Id: string;

  beforeEach(async () => {
    const u1 = await User.create({
      email: 'maya@swap.app',
      username: 'maya_vibes',
      name: 'Maya Lin',
      passwordHash: 'hash',
      activeVibe: 'CHILL',
    });
    const u2 = await User.create({
      email: 'kai@swap.app',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      passwordHash: 'hash',
      activeVibe: 'HYPE',
    });
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();

    // Mutual follows
    await Follow.create([
      { follower: u1._id, following: u2._id, status: 'ACCEPTED' },
      { follower: u2._id, following: u1._id, status: 'ACCEPTED' },
    ]);

    const r1 = await Reel.create({
      author: u1._id,
      caption: 'Initial challenge reel',
      videoUrl: 'https://cdn.example.com/r1.mp4',
      thumbnailUrl: 'https://cdn.example.com/t1.jpg',
      duration: 12,
    });
    const r2 = await Reel.create({
      author: u2._id,
      caption: 'Reply duet reel',
      videoUrl: 'https://cdn.example.com/r2.mp4',
      thumbnailUrl: 'https://cdn.example.com/t2.jpg',
      duration: 12,
    });
    reel1Id = r1._id.toString();
    reel2Id = r2._id.toString();
  });

  it('should create a Swap Challenge with a prompt and initiator reel', async () => {
    const challenge = await swapService.createChallenge(user1Id, {
      prompt: 'Show me your 10s studio workflow 🎨',
      recipientId: user2Id,
      initiatorReelId: reel1Id,
    });

    expect(challenge.id).toBeDefined();
    expect(challenge.status).toBe('PENDING');
    expect(challenge.prompt).toBe('Show me your 10s studio workflow 🎨');
    expect(challenge.initiator.username).toBe('maya_vibes');
    expect(challenge.recipient.username).toBe('kai_creates');
  });

  it('should allow recipient to reply to Swap Challenge, completing the duet', async () => {
    const challenge = await swapService.createChallenge(user1Id, {
      prompt: 'Show me your 10s studio workflow 🎨',
      recipientId: user2Id,
      initiatorReelId: reel1Id,
    });

    const completed = await swapService.replyChallenge(user2Id, challenge.id, reel2Id);

    expect(completed.status).toBe('COMPLETED');
    expect(completed.replyReel).toBeDefined();
    expect(completed.completedAt).toBeDefined();

    // Check that reply reel links to initiator reel
    const replyDoc = await Reel.findById(reel2Id);
    expect(replyDoc?.duetParentReel?.toString()).toBe(reel1Id);
  });

  it('should fetch completed Swap Duets for the split-screen feed', async () => {
    const challenge = await swapService.createChallenge(user1Id, {
      prompt: 'Duet challenge feed test',
      recipientId: user2Id,
      initiatorReelId: reel1Id,
    });
    await swapService.replyChallenge(user2Id, challenge.id, reel2Id);

    const duets = await swapService.getDuetsFeed();
    expect(duets.duets.length).toBeGreaterThan(0);
    expect(duets.duets[0].isDuet).toBe(true);
    expect(duets.duets[0].initiatorReel).toBeDefined();
    expect(duets.duets[0].replyReel).toBeDefined();
  });

  it('should match mutual followers for Swap Day and fetch partner highlights', async () => {
    const match = await swapService.getSwapDayMatch(user1Id);

    expect(match).toBeDefined();
    expect(match?.partner.id).toBe(user2Id);
    expect(match?.partner.username).toBe('kai_creates');
    expect(match?.date).toBe(new Date().toISOString().split('T')[0]);
  });

  it('should save a vibe note on Swap Day match', async () => {
    const match = await swapService.getSwapDayMatch(user1Id);
    expect(match).toBeDefined();

    const noteRes = await swapService.saveSwapDayVibeNote(
      user1Id,
      match!.id,
      'Your motion graphics are top tier! 🚀'
    );
    expect(noteRes.success).toBe(true);

    const updatedMatch = await swapService.getSwapDayMatch(user2Id);
    expect(updatedMatch?.partnerVibeNote).toBe('Your motion graphics are top tier! 🚀');
  });

  it('should allow user to Vibe Swap (change active vibe to HYPE, FOCUS, DARK)', async () => {
    const updated = await userService.updateVibe(user1Id, 'HYPE');
    expect(updated?.activeVibe).toBe('HYPE');

    const profile = await userService.getProfile('maya_vibes');
    expect(profile.activeVibe).toBe('HYPE');
  });
});

