import mongoose, { Types } from 'mongoose';
import { connectDatabase } from '../src/config/database';
import { User, Post, Like, Comment, TimeCapsule, Notification } from '../src/models';
import { hashPassword, comparePassword } from '../src/utils/password';

describe('MongoDB Connection & CRUD Operations Verification', () => {
  it('1. should connect and reuse the database connection safely across repeated calls', async () => {
    // First call: ensures connection is ready
    const conn1 = await connectDatabase();
    expect(conn1).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1);

    // Second call: should immediately reuse existing connection without re-connecting
    const conn2 = await connectDatabase();
    expect(conn2).toBe(conn1);
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('2. should perform safe database ping and measure latency', async () => {
    expect(mongoose.connection.readyState).toBe(1);
    expect(mongoose.connection.db).toBeDefined();

    const start = Date.now();
    const pingResult = await mongoose.connection.db!.admin().ping();
    const latency = Date.now() - start;

    expect(pingResult).toBeDefined();
    expect(pingResult.ok).toBe(1);
    expect(latency).toBeGreaterThanOrEqual(0);
  });

  it('3. should perform real User registration and login credential verification in MongoDB', async () => {
    const rawPassword = 'SecurePassword123!';
    const passwordHash = await hashPassword(rawPassword);

    const testUser = await User.create({
      email: 'atlas_test@swap.app',
      username: 'atlas_tester',
      name: 'Atlas Tester',
      passwordHash,
      role: 'USER',
      isEmailVerified: true,
      activeVibe: 'FOCUS',
    });

    expect(testUser._id).toBeDefined();
    expect(testUser.email).toBe('atlas_test@swap.app');
    expect(testUser.username).toBe('atlas_tester');
    expect(testUser.createdAt).toBeInstanceOf(Date);

    // Retrieve user by email (simulating login lookup)
    const foundUser = await User.findOne({ email: 'atlas_test@swap.app' });
    expect(foundUser).not.toBeNull();
    expect(foundUser?.username).toBe('atlas_tester');

    // Verify password matching
    const isPasswordValid = await comparePassword(rawPassword, foundUser!.passwordHash);
    expect(isPasswordValid).toBe(true);

    const isWrongPasswordValid = await comparePassword('WrongPassword!', foundUser!.passwordHash);
    expect(isWrongPasswordValid).toBe(false);
  });

  it('4. should perform Post creation, author population, likes, and comments in MongoDB', async () => {
    const author = await User.create({
      email: 'creator@swap.app',
      username: 'creator_user',
      name: 'Creator User',
      passwordHash: 'hash',
    });

    // Create Post
    const post = await Post.create({
      author: author._id,
      caption: 'Testing MongoDB Atlas persistence #swap #tech',
      location: 'San Francisco, CA',
      mood: 'ENERGETIC',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
          type: 'IMAGE',
          order: 0,
        },
      ],
      hashtags: ['swap', 'tech'],
    });

    expect(post._id).toBeDefined();
    expect(post.author.toString()).toBe(author._id.toString());
    expect(post.caption).toContain('#swap');

    // Query and populate author
    const populatedPost = await Post.findById(post._id).populate('author');
    expect(populatedPost).not.toBeNull();
    expect((populatedPost!.author as any).username).toBe('creator_user');

    // Create Like
    const like = await Like.create({
      user: author._id,
      post: post._id,
    });
    expect(like._id).toBeDefined();

    // Create Comment
    const comment = await Comment.create({
      author: author._id,
      post: post._id,
      content: 'Database verification comment',
    });
    expect(comment._id).toBeDefined();
    expect(comment.content).toBe('Database verification comment');

    // Verify compound queries
    const commentsCount = await Comment.countDocuments({ post: post._id });
    expect(commentsCount).toBe(1);
  });

  it('5. should perform Time Capsule creation and lock/unlock queries in MongoDB', async () => {
    const author = await User.create({
      email: 'capsule_user@swap.app',
      username: 'capsule_author',
      name: 'Capsule Author',
      passwordHash: 'hash',
    });

    const unlockDate = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days in future

    const capsule = await TimeCapsule.create({
      author: author._id,
      title: 'Graduation Memory',
      caption: 'Do not open until next week!',
      unlocksAt: unlockDate,
      isUnlocked: false,
    });

    expect(capsule._id).toBeDefined();
    expect(capsule.isUnlocked).toBe(false);

    // Query locked capsules
    const locked = await TimeCapsule.find({ author: author._id, isUnlocked: false });
    expect(locked.length).toBe(1);
    expect(locked[0].title).toBe('Graduation Memory');
  });

  it('6. should create and retrieve real Notifications in MongoDB', async () => {
    const user1 = await User.create({
      email: 'notif1@swap.app',
      username: 'notif_actor',
      name: 'Actor',
      passwordHash: 'hash',
    });
    const user2 = await User.create({
      email: 'notif2@swap.app',
      username: 'notif_recip',
      name: 'Recipient',
      passwordHash: 'hash',
    });

    const notif = await Notification.create({
      actor: user1._id,
      recipient: user2._id,
      type: 'LIKE',
      read: false,
      previewText: 'liked your post',
    });

    expect(notif._id).toBeDefined();
    expect(notif.read).toBe(false);

    // Retrieve unread notifications for recipient
    const unread = await Notification.find({ recipient: user2._id, read: false });
    expect(unread.length).toBe(1);
    expect(unread[0].previewText).toBe('liked your post');
  });
});
