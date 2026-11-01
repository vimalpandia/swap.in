import { postService } from '../src/services/post.service';
import { User, Post, Like } from '../src/models';

describe('Posts & Feed Service Tests', () => {
  let testUserId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'creator@swap.app',
      username: 'creator_swap',
      name: 'Creator',
      passwordHash: 'hashed',
    });
    testUserId = user._id.toString();
  });

  it('should create a multi-image post with mood and location', async () => {
    const post = await postService.createPost(testUserId, {
      caption: 'Golden hour in Shibuya 🌆 #swap #vibes',
      location: 'Tokyo Shibuya Sky',
      mood: 'CURIOUS',
      media: [
        { url: 'https://images.unsplash.com/photo-1.jpg', type: 'IMAGE', order: 0 },
        { url: 'https://images.unsplash.com/photo-2.jpg', type: 'IMAGE', order: 1 },
      ],
      hashtags: ['swap', 'vibes'],
    });

    expect(post.id).toBeDefined();
    expect(post.location).toBe('Tokyo Shibuya Sky');
    expect(post.mood).toBe('CURIOUS');
    expect(post.media.length).toBe(2);
    expect(post.author.username).toBe('creator_swap');
  });

  it('should fetch paginated feed with cursor', async () => {
    await postService.createPost(testUserId, {
      caption: 'Post 1 #swap',
      media: [{ url: 'https://img.jpg', type: 'IMAGE', order: 0 }],
    });
    await postService.createPost(testUserId, {
      caption: 'Post 2 #swap',
      media: [{ url: 'https://img.jpg', type: 'IMAGE', order: 0 }],
    });

    const feed = await postService.getFeed({ limit: 1 });
    expect(feed.items.length).toBe(1);
    expect(feed.hasMore).toBe(true);
    expect(feed.nextCursor).toBeDefined();
  });

  it('should toggle like on a post and increment likesCount atomically', async () => {
    const post = await postService.createPost(testUserId, {
      caption: 'Testing likes #swap',
      media: [{ url: 'https://img.jpg', type: 'IMAGE', order: 0 }],
    });

    const likeResult = await postService.toggleLike(testUserId, post.id);
    expect(likeResult.isLiked).toBe(true);

    const postAfterLike = await Post.findById(post.id);
    expect(postAfterLike?.likesCount).toBe(1);

    const unlikeResult = await postService.toggleLike(testUserId, post.id);
    expect(unlikeResult.isLiked).toBe(false);

    const postAfterUnlike = await Post.findById(post.id);
    expect(postAfterUnlike?.likesCount).toBe(0);
  });

  it('should toggle save on a post', async () => {
    const post = await postService.createPost(testUserId, {
      caption: 'Testing save #swap',
      media: [{ url: 'https://img.jpg', type: 'IMAGE', order: 0 }],
    });

    const saveResult = await postService.toggleSave(testUserId, post.id);
    expect(saveResult.isSaved).toBe(true);

    const unsaveResult = await postService.toggleSave(testUserId, post.id);
    expect(unsaveResult.isSaved).toBe(false);
  });

  it('should soft delete post by author', async () => {
    const post = await postService.createPost(testUserId, {
      caption: 'To be deleted',
      media: [{ url: 'https://img.jpg', type: 'IMAGE', order: 0 }],
    });

    const result = await postService.deletePost(post.id, testUserId);
    expect(result.success).toBe(true);

    const check = await Post.findById(post.id);
    expect(check?.deletedAt).toBeDefined();
  });
});
