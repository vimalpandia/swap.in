import { create } from 'zustand';

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isCreatePostOpen: boolean;
  isCreateReelOpen: boolean;
  isCreateCapsuleOpen: boolean;
  isAIAssistOpen: boolean;
  activeWatchPartyRoom: string | null;
  activeWatchPartyReelId: string | null;
  toast: ToastNotification | null;

  setCreatePostOpen: (open: boolean) => void;
  setCreateReelOpen: (open: boolean) => void;
  setCreateCapsuleOpen: (open: boolean) => void;
  setAIAssistOpen: (open: boolean) => void;
  startWatchParty: (roomId: string, reelId: string) => void;
  closeWatchParty: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

let toastTimer: any = null;

export const useUIStore = create<UIState>((set) => ({
  isCreatePostOpen: false,
  isCreateReelOpen: false,
  isCreateCapsuleOpen: false,
  isAIAssistOpen: false,
  activeWatchPartyRoom: null,
  activeWatchPartyReelId: null,
  toast: null,

  setCreatePostOpen: (open) => set({ isCreatePostOpen: open }),
  setCreateReelOpen: (open) => set({ isCreateReelOpen: open }),
  setCreateCapsuleOpen: (open) => set({ isCreateCapsuleOpen: open }),
  setAIAssistOpen: (open) => set({ isAIAssistOpen: open }),
  startWatchParty: (roomId, reelId) => set({ activeWatchPartyRoom: roomId, activeWatchPartyReelId: reelId }),
  closeWatchParty: () => set({ activeWatchPartyRoom: null, activeWatchPartyReelId: null }),
  showToast: (message, type = 'info') => {
    if (toastTimer) clearTimeout(toastTimer);
    const id = Date.now();
    set({ toast: { id, message, type } });
    toastTimer = setTimeout(() => {
      set({ toast: null });
    }, 3500);
  },
  dismissToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: null });
  },
}));
