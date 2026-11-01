import { MoodType, VibeType } from './constants';

export type Role = 'USER' | 'ADMIN';
export type MediaType = 'IMAGE' | 'VIDEO';

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'TIME_CAPSULE_UNLOCKED'
  | 'COLLAB_INVITE'
  | 'COLLAB_ACCEPTED'
  | 'STREAK_ALERT'
  | 'SWAP_CHALLENGE_INVITE'
  | 'SWAP_CHALLENGE_REPLIED'
  | 'SWAP_DAY_MATCH';

export type CollabStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type SwapChallengeStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'DECLINED';

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'SYSTEM'
  | 'WATCH_PARTY_INVITE'
  | 'SWAP_CHALLENGE_INVITE';

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isVerified?: boolean;
}

export interface UserProfile extends UserSummary {
  bio: string | null;
  website: string | null;
  isPrivate: boolean;
  ghostMode: boolean;
  activeVibe: VibeType;
  focusGuardMinutes: number; // 0 = disabled, or e.g. 30
  currentStreakCount: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  hasPendingFollowRequest?: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface PostMedia {
  url: string;
  type: MediaType;
  width?: number;
  height?: number;
  order: number;
}

export interface PostItem {
  id: string;
  caption: string | null;
  location: string | null;
  mood: MoodType | null;
  author: UserSummary;
  media: PostMedia[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReelItem {
  id: string;
  caption: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  hlsPlaylistUrl?: string | null;
  duration: number; // in seconds
  audioName: string;
  mood: MoodType | null;
  author: UserSummary;
  coAuthor?: UserSummary | null;
  collabStatus?: CollabStatus | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewCount: number;
  isLiked: boolean;
  isSaved: boolean;
  hashtags: string[];
  recommendationScore?: number;
  // Swap Duet / Challenge relation
  duetParentReelId?: string | null;
  createdAt: string;
}

export interface SwapChallengeItem {
  id: string;
  prompt: string;
  initiator: UserSummary;
  recipient: UserSummary;
  initiatorReel: ReelItem;
  replyReel?: ReelItem | null;
  status: SwapChallengeStatus;
  isDuet: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface SwapDayMatchItem {
  id: string;
  date: string;
  partner: UserSummary;
  partnerVibeNote?: string | null;
  myVibeNote?: string | null;
  partnerHighlights: PostItem[];
}

export interface CommentItem {
  id: string;
  content: string;
  postId?: string | null;
  reelId?: string | null;
  parentId?: string | null;
  author: UserSummary;
  likesCount: number;
  isLiked: boolean;
  replyCount: number;
  replies?: CommentItem[];
  createdAt: string;
}

export interface StoryViewerItem {
  user: UserSummary;
  viewedAt: string;
  reaction?: string | null;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  duration: number;
  caption?: string | null;
  author: UserSummary;
  expiresAt: string;
  createdAt: string;
  isViewed: boolean;
  viewersCount: number;
  viewers?: StoryViewerItem[];
}

export interface StoryTrayItem {
  author: UserSummary;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export interface TimeCapsuleItem {
  id: string;
  title: string;
  caption: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  author: UserSummary;
  recipientUser?: UserSummary | null;
  unlocksAt: string;
  isUnlocked: boolean;
  createdAt: string;
}

export interface WasteTimeDailyStats {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  reelsWatchedCount: number;
}

export interface WasteTimeDashboard {
  todayMinutes: number;
  weeklyTotalMinutes: number;
  reelsWatchedToday: number;
  currentBadge: {
    level: string;
    name: string;
    icon: string;
    minMinutes: number;
  };
  nextBadge?: {
    level: string;
    name: string;
    icon: string;
    minMinutes: number;
    remainingMinutes: number;
  } | null;
  dailyHistory: WasteTimeDailyStats[];
}

export interface StreakItem {
  id: string;
  user1: UserSummary;
  user2: UserSummary;
  currentStreak: number;
  longestStreak: number;
  lastInteractionAt: string;
  expiresAt: string;
  isExpiringSoon: boolean; // within 4 hours
}

export interface MessageItem {
  id: string;
  conversationId: string;
  sender: UserSummary;
  type: MessageType;
  content: string;
  mediaUrl?: string | null;
  isDeleted: boolean;
  readBy: string[]; // user IDs
  reactions: Record<string, string[]>; // emoji -> array of userIds
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  isGroup: boolean;
  title?: string | null;
  participants: UserSummary[];
  lastMessage?: MessageItem | null;
  unreadCount: number;
  streakWithPeer?: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: UserSummary;
  recipientId: string;
  postId?: string | null;
  reelId?: string | null;
  commentId?: string | null;
  capsuleId?: string | null;
  swapChallengeId?: string | null;
  read: boolean;
  createdAt: string;
  previewText?: string | null;
}

export interface WatchPartySession {
  roomId: string;
  reelId: string;
  hostId: string;
  participants: UserSummary[];
  playbackState: {
    currentTime: number;
    isPlaying: boolean;
    updatedAt: number;
  };
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
