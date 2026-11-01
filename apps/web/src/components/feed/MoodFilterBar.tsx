'use client';

import React from 'react';
import { Sparkles, Moon, Laugh, Zap, Compass } from 'lucide-react';
import { MoodType } from '@swap/shared';
import { cn } from '../../lib/utils';

interface MoodFilterBarProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType | null) => void;
}

const moods: Array<{ id: MoodType | null; label: string; icon: any; color: string }> = [
  { id: null, label: 'All Vibes', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'CHILL', label: 'Chill', icon: Moon, color: 'text-indigo-400' },
  { id: 'FUNNY', label: 'Funny', icon: Laugh, color: 'text-amber-400' },
  { id: 'MOTIVATED', label: 'Motivated', icon: Zap, color: 'text-pink-400' },
  { id: 'CURIOUS', label: 'Curious', icon: Compass, color: 'text-amber-300' },
];

export function MoodFilterBar({ selectedMood, onSelectMood }: MoodFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-1 scrollbar-none select-none">
      {moods.map((m) => {
        const Icon = m.icon;
        const isSelected = selectedMood === m.id;

        return (
          <button
            key={m.label}
            onClick={() => onSelectMood(m.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              isSelected
                ? 'bg-swap-gradient text-white shadow-md shadow-pink-500/20 font-semibold scale-105'
                : 'bg-swap-surface border border-swap-border text-swap-muted hover:text-white hover:border-pink-500/30'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isSelected ? 'text-white' : m.color)} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
