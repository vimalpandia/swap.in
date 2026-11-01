import { z } from 'zod';
import { MOODS, VIBES } from './constants';

export const moodSchema = z.enum(MOODS);
export const vibeSchema = z.enum(VIBES);

// Helper for MongoDB ObjectId or string IDs
export const idSchema = z.string().min(1);

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain alphanumeric characters, underscores, and dots'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(300).optional().nullable(),
  website: z.string().url().max(200).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  isPrivate: z.boolean().optional(),
  ghostMode: z.boolean().optional(),
  activeVibe: vibeSchema.optional(),
  focusGuardMinutes: z.number().int().min(0).max(240).optional(),
});

// Post schemas
export const createPostSchema = z.object({
  caption: z.string().max(2200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mood: moodSchema.optional().nullable(),
  media: z
    .array(
      z.object({
        url: z.string().url('Valid media URL required'),
        type: z.enum(['IMAGE', 'VIDEO']),
        width: z.number().optional(),
        height: z.number().optional(),
        order: z.number().int().default(0),
      })
    )
    .min(1, 'At least one media item is required')
    .max(10, 'Maximum 10 media items allowed'),
  hashtags: z.array(z.string()).optional(),
});

export const updatePostSchema = z.object({
  caption: z.string().max(2200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mood: moodSchema.optional().nullable(),
});

// Reel schemas ("Waste of Time")
export const createReelSchema = z.object({
  caption: z.string().max(2200).optional().nullable(),
  videoUrl: z.string().url('Valid video URL required'),
  thumbnailUrl: z.string().url('Valid thumbnail URL required'),
  hlsPlaylistUrl: z.string().url().optional().nullable(),
  duration: z.number().min(1).max(180),
  audioName: z.string().min(1).max(100).default('Original Audio'),
  mood: moodSchema.optional().nullable(),
  hashtags: z.array(z.string()).optional(),
  coAuthorId: idSchema.optional().nullable(),
  duetParentReelId: idSchema.optional().nullable(),
});

export const logWatchTimeSchema = z.object({
  reelId: idSchema,
  watchDurationSeconds: z.number().min(1).max(3600),
  completed: z.boolean().default(false),
});

// Comment schemas
export const addCommentSchema = z
  .object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000),
    postId: idSchema.optional().nullable(),
    reelId: idSchema.optional().nullable(),
    parentId: idSchema.optional().nullable(),
  })
  .refine((data) => data.postId || data.reelId, {
    message: 'Either postId or reelId must be provided',
  });

// Story schemas
export const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  duration: z.number().min(1).max(60).default(15),
  caption: z.string().max(200).optional().nullable(),
});

// Time Capsule schemas
export const createTimeCapsuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  caption: z.string().max(2000).optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional().nullable(),
  unlocksAt: z.string(),
  recipientId: idSchema.optional().nullable(),
});

// Chat schemas
export const sendMessageSchema = z.object({
  conversationId: idSchema.optional().nullable(),
  recipientId: idSchema.optional().nullable(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'SYSTEM', 'WATCH_PARTY_INVITE', 'SWAP_CHALLENGE_INVITE']).default('TEXT'),
  content: z.string().min(1).max(4000),
  mediaUrl: z.string().url().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export const createConversationSchema = z.object({
  participantIds: z.array(idSchema).min(1),
  isGroup: z.boolean().default(false),
  title: z.string().max(100).optional().nullable(),
});

// Swap Challenge schemas
export const createSwapChallengeSchema = z.object({
  recipientId: idSchema,
  prompt: z.string().min(3, 'Prompt must be at least 3 characters').max(200),
  initiatorReelId: idSchema,
});

export const replySwapChallengeSchema = z.object({
  challengeId: idSchema,
  replyReelId: idSchema,
});

export const swapDayNoteSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty').max(280),
});

// AI Assist schemas
export const aiCaptionRequestSchema = z.object({
  prompt: z.string().min(3).max(500),
  mood: moodSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const aiSmartReplyRequestSchema = z.object({
  incomingMessage: z.string().min(1).max(1000),
  contextMessages: z.array(z.string()).optional(),
});

// Pagination query schema
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  mood: moodSchema.optional(),
  vibe: vibeSchema.optional(),
});
