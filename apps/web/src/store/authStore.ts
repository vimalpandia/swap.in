import { create } from 'zustand';
import { UserProfile, VibeType } from '@swap/shared';
import { api } from '../lib/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  activeVibe: VibeType;
  setUser: (user: UserProfile | null, token?: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserProfile>) => Promise<void>;
  setVibe: (vibe: VibeType) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  activeVibe: 'CHILL',

  setUser: (user, token) => {
    if (token) localStorage.setItem('swap_access_token', token);
    if (user) {
      localStorage.setItem('swap_user', JSON.stringify(user));
      set({ user, token: token || get().token, activeVibe: user.activeVibe || 'CHILL', isLoading: false });
    } else {
      set({ user: null, token: null, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('swap_access_token');
    localStorage.removeItem('swap_user');
    api.post('/auth/logout').catch(() => {});
    set({ user: null, token: null, isLoading: false });
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('swap_access_token');
    const storedUser = localStorage.getItem('swap_user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        set({ user: parsed, token, activeVibe: parsed.activeVibe || 'CHILL', isLoading: false });
        return;
      } catch {
        // Parse error fallback
      }
    }

    // Default mock demo session for instant out-of-the-box exploration
    const demoUser: UserProfile = {
      id: 'demo-user-alex',
      username: 'alex_swap',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Building the next web experience ⚡ Procrastinating intentionally in Waste of Time.',
      website: 'https://alexrivera.dev',
      isPrivate: false,
      ghostMode: false,
      activeVibe: 'CHILL',
      focusGuardMinutes: 30,
      currentStreakCount: 14,
      followersCount: 1420,
      followingCount: 380,
      postsCount: 24,
      reelsCount: 18,
      createdAt: new Date().toISOString(),
    };

    set({ user: demoUser, activeVibe: 'CHILL', isLoading: false });
  },

  updateUserPreferences: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    set({ user: updated });
    localStorage.setItem('swap_user', JSON.stringify(updated));
    try {
      await api.patch('/users/profile', data);
    } catch {
      // Offline resilient
    }
  },

  setVibe: async (vibe: VibeType) => {
    set({ activeVibe: vibe });
    const current = get().user;
    if (current) {
      const updated = { ...current, activeVibe: vibe };
      set({ user: updated });
      localStorage.setItem('swap_user', JSON.stringify(updated));
    }
    try {
      await api.put('/users/vibe', { vibe });
    } catch {
      // Resilient
    }
  },
}));
