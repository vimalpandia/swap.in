import { describe, it, expect } from 'vitest';
import { formatTimeAgo, formatNumber, cn } from '../src/lib/utils';

describe('Frontend Utilities', () => {
  it('should format numbers with k and M abbreviations', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1420)).toBe('1.4k');
    expect(formatNumber(1500000)).toBe('1.5M');
  });

  it('should format relative time ago timestamps', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    expect(formatTimeAgo(tenMinutesAgo)).toBe('10m');
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h');
  });

  it('should merge tailwind class names properly', () => {
    expect(cn('px-2 py-1', 'text-white')).toBe('px-2 py-1 text-white');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});

