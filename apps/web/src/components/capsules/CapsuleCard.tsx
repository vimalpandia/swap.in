'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Clock, Calendar, Sparkles } from 'lucide-react';
import { TimeCapsuleItem } from '@swap/shared';

interface CapsuleCardProps {
  capsule: TimeCapsuleItem;
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: capsule.isUnlocked });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const unlockTime = new Date(capsule.unlocksAt).getTime();
      const diff = unlockTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [capsule.unlocksAt]);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#06B6D4', '#F43F5E', '#F59E0B'],
    });
  };

  const isLocked = !timeLeft.isPast && !capsule.isUnlocked;

  return (
    <div
      onClick={() => {
        if (!isLocked) triggerCelebrate();
      }}
      className={`rounded-2xl border p-5 select-none transition-all duration-300 relative overflow-hidden ${
        isLocked
          ? 'bg-gradient-to-b from-[#12141F] to-[#0A0C14] border-violet-500/30 shadow-lg shadow-violet-950/20'
          : 'bg-[#12141F] border-cyan-500/40 shadow-xl shadow-cyan-950/20 cursor-pointer'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <img
            src={capsule.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={capsule.author.username}
            className="w-8 h-8 rounded-full object-cover border border-violet-500/40"
          />
          <div>
            <span className="text-xs font-bold text-white block">@{capsule.author.username}</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Unlocks: {new Date(capsule.unlocksAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isLocked
              ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300 animate-pulse-slow'
              : 'bg-teal-950/60 border border-teal-500/40 text-teal-300'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isLocked ? 'LOCKED' : 'UNLOCKED'}</span>
        </span>
      </div>

      {/* Capsule Title */}
      <h3 className="text-base font-bold text-white mb-2">{capsule.title}</h3>

      {/* Content State: Locked with Live Countdown vs Unlocked */}
      {isLocked ? (
        <div className="my-4 p-5 rounded-xl bg-[#090A0F]/80 border border-violet-500/20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-400">
            <Lock className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-400">Countdown to automated unlock</span>
            <div className="flex items-center gap-2 font-mono text-xl sm:text-2xl font-black text-cyan-400">
              <span className="bg-[#161926] px-2 py-1 rounded-lg border border-[#1F2438]">
                {String(timeLeft.days).padStart(2, '0')}d
              </span>
              <span>:</span>
              <span className="bg-[#161926] px-2 py-1 rounded-lg border border-[#1F2438]">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="bg-[#161926] px-2 py-1 rounded-lg border border-[#1F2438]">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="bg-[#161926] px-2 py-1 rounded-lg border border-[#1F2438]">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic max-w-xs">
            Media and secret message encrypted until the countdown reaches zero.
          </p>
        </div>
      ) : (
        <div className="my-3 space-y-3">
          {capsule.mediaUrl && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#1F2438]">
              <img
                src={capsule.mediaUrl}
                alt={capsule.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}

          {capsule.caption && (
            <p className="text-xs text-gray-200 leading-relaxed bg-[#161926] p-3 rounded-xl border border-[#1F2438]">
              {capsule.caption}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Time capsule opened! Click to celebrate
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

