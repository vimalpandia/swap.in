'use client';

import React from 'react';
import { Clock, ShieldAlert, Award } from 'lucide-react';
import { useWasteTimeStore } from '../../store/wasteTimeStore';

export function TimeWastedHUD() {
  const { todayMinutes, sessionSeconds, activeBadge, focusGuardMinutes } = useWasteTimeStore();

  const sessionMins = Math.floor(sessionSeconds / 60);
  const sessionSecs = sessionSeconds % 60;

  const minutesUntilGuard = Math.max(0, focusGuardMinutes - todayMinutes);

  return (
    <div className="fixed top-4 left-4 sm:left-72 z-30 flex items-center gap-2 select-none pointer-events-auto">
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#090A0F]/85 backdrop-blur-md border border-amber-500/30 shadow-xl shadow-amber-950/20 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
          <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m wasted
          </span>
        </div>

        <span className="text-[#1F2438]">|</span>

        <div className="flex items-center gap-1 text-gray-300 font-medium">
          <span>{activeBadge.icon}</span>
          <span className="hidden sm:inline text-[11px]">{activeBadge.name}</span>
        </div>

        {focusGuardMinutes > 0 && (
          <>
            <span className="text-[#1F2438] hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
              <ShieldAlert className="w-3 h-3" />
              <span>Guard: {minutesUntilGuard}m</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

