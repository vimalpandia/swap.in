/**
 * Swap Platform Constants & Configurations
 */

export const SWAP_BRAND = {
  NAME: 'Swap',
  TAGLINE: 'Swap moments. Swap vibes.',
  REELS_TITLE: 'Waste of Time',
  PRIMARY_COLOR: '#4F46E5',   // Deep Indigo
  ACCENT_COLOR: '#EC4899',    // Hot Pink
  SECONDARY_COLOR: '#F59E0B', // Amber
  BACKGROUND_DARK: '#090A10',
  BACKGROUND_LIGHT: '#F8FAFC',
};

// Vibe Swap core moods
export const VIBES = ['CHILL', 'HYPE', 'FOCUS', 'DARK'] as const;
export type VibeType = (typeof VIBES)[number];

export const MOODS = ['CHILL', 'HYPE', 'FOCUS', 'DARK', 'FUNNY', 'MOTIVATED', 'CURIOUS'] as const;
export type MoodType = (typeof MOODS)[number];

export const BADGE_LEVELS = [
  { level: 'BRONZE_PROCRASTINATOR', name: 'Bronze Procrastinator', minMinutes: 15, icon: '🥉' },
  { level: 'SILVER_SLACKER', name: 'Silver Slacker', minMinutes: 45, icon: '🥈' },
  { level: 'GOLDEN_IDLER', name: 'Golden Idler', minMinutes: 90, icon: '🥇' },
  { level: 'PLATINUM_SWAPPER', name: 'Platinum Swapper', minMinutes: 150, icon: '💎' },
  { level: 'LEGENDARY_TIME_WASTER', name: 'Legendary Time Waster', minMinutes: 240, icon: '👑' },
] as const;

export const FOCUS_GUARD_PRESETS = [15, 30, 45, 60] as const; // minutes
export const STORY_EXPIRY_HOURS = 24;
export const STORY_EXPIRY_SECONDS = 86400; // For MongoDB TTL index
export const STORY_EXPIRY_MS = STORY_EXPIRY_HOURS * 60 * 60 * 1000;

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
