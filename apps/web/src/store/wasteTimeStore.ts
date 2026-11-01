import { create } from 'zustand';
import { BADGE_LEVELS, WasteTimeDashboard } from '@swap/shared';
import { api } from '../lib/api';

interface WasteTimeState {
  todayMinutes: number;
  sessionSeconds: number;
  isWatching: boolean;
  focusGuardMinutes: number;
  showFocusGuard: boolean;
  activeBadge: {
    level: string;
    name: string;
    icon: string;
  };
  startSession: () => void;
  tickSession: () => void;
  pauseSession: () => void;
  snoozeFocusGuard: (minutes?: number) => void;
  setFocusGuardLimit: (minutes: number) => void;
  fetchDashboard: () => Promise<WasteTimeDashboard | null>;
}

export const useWasteTimeStore = create<WasteTimeState>((set, get) => ({
  todayMinutes: 48, // Demo starter: 48 mins (Silver Slacker)
  sessionSeconds: 0,
  isWatching: false,
  focusGuardMinutes: 30,
  showFocusGuard: false,
  activeBadge: {
    level: 'SILVER_SLACKER',
    name: 'Silver Slacker',
    icon: '🥈',
  },

  startSession: () => set({ isWatching: true }),

  tickSession: () => {
    const { sessionSeconds, todayMinutes, focusGuardMinutes, showFocusGuard } = get();
    const newSeconds = sessionSeconds + 1;
    const newTodayMinutes = todayMinutes + (newSeconds % 60 === 0 ? 1 : 0);

    // Calculate current badge
    let activeBadge = { level: 'NOVICE', name: 'Novice Scroller', icon: '🌱' };
    for (const b of BADGE_LEVELS) {
      if (newTodayMinutes >= b.minMinutes) {
        activeBadge = { level: b.level, name: b.name, icon: b.icon };
      }
    }

    // Trigger Focus Guard if limit reached and not already shown
    let triggerGuard = showFocusGuard;
    if (focusGuardMinutes > 0 && newTodayMinutes >= focusGuardMinutes && !showFocusGuard && newSeconds % 60 === 0) {
      triggerGuard = true;
    }

    set({
      sessionSeconds: newSeconds,
      todayMinutes: newTodayMinutes,
      activeBadge,
      showFocusGuard: triggerGuard,
    });

    // Every 30 seconds, persist to API
    if (newSeconds % 30 === 0) {
      api.post('/waste-time/log', { durationSeconds: 30 }).catch(() => {});
    }
  },

  pauseSession: () => set({ isWatching: false }),

  snoozeFocusGuard: (minutes = 15) => {
    const { focusGuardMinutes } = get();
    set({
      showFocusGuard: false,
      focusGuardMinutes: focusGuardMinutes + minutes,
    });
  },

  setFocusGuardLimit: (minutes) => set({ focusGuardMinutes: minutes }),

  fetchDashboard: async () => {
    try {
      const res = await api.get('/waste-time/dashboard');
      if (res.data.success) {
        const d: WasteTimeDashboard = res.data.data;
        set({
          todayMinutes: d.todayMinutes,
          activeBadge: {
            level: d.currentBadge.level,
            name: d.currentBadge.name,
            icon: d.currentBadge.icon,
          },
        });
        return d;
      }
    } catch {
      // Offline fallback
    }
    return null;
  },
}));

