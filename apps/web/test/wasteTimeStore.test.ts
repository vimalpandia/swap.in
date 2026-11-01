import { describe, it, expect, beforeEach } from 'vitest';
import { useWasteTimeStore } from '../src/store/wasteTimeStore';

describe('WasteTimeStore & Focus Guard', () => {
  beforeEach(() => {
    useWasteTimeStore.setState({
      todayMinutes: 10,
      sessionSeconds: 0,
      isWatching: false,
      focusGuardMinutes: 30,
      showFocusGuard: false,
      activeBadge: { level: 'NOVICE', name: 'Novice Scroller', icon: '🌱' },
    });
  });

  it('initializes with default watch stats', () => {
    const state = useWasteTimeStore.getState();
    expect(state.todayMinutes).toBe(10);
    expect(state.focusGuardMinutes).toBe(30);
  });

  it('updates focus guard limit', () => {
    useWasteTimeStore.getState().setFocusGuardLimit(45);
    expect(useWasteTimeStore.getState().focusGuardMinutes).toBe(45);
  });

  it('snoozes focus guard by specified minutes', () => {
    useWasteTimeStore.setState({ showFocusGuard: true, focusGuardMinutes: 30 });
    useWasteTimeStore.getState().snoozeFocusGuard(15);

    const state = useWasteTimeStore.getState();
    expect(state.showFocusGuard).toBe(false);
    expect(state.focusGuardMinutes).toBe(45);
  });
});

