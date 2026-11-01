'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Users, Shuffle, Flame, ArrowRight, Heart, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { VibeType, VIBES } from '@swap/shared';
import { api } from '../../lib/api';

export function RightSidebar() {
  const { user, activeVibe, setVibe } = useAuthStore();
  const { showToast } = useUIStore();
  const [swapDayPartner, setSwapDayPartner] = useState<any>(null);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      api
        .get('/swap/day')
        .then((res) => {
          if (res.data?.success && res.data.data?.partner) {
            setSwapDayPartner(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleFollow = (username: string) => {
    const isNowFollowing = !followingStates[username];
    setFollowingStates((prev) => ({ ...prev, [username]: isNowFollowing }));
    if (isNowFollowing) {
      showToast(`Followed @${username}!`, 'success');
    } else {
      showToast(`Unfollowed @${username}`, 'info');
    }
  };

  const vibeOptions: { type: VibeType; label: string; icon: string; glow: string }[] = [
    { type: 'CHILL', label: 'Chill', icon: '🌊', glow: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300' },
    { type: 'HYPE', label: 'Hype', icon: '⚡', glow: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300' },
    { type: 'FOCUS', label: 'Focus', icon: '🎯', glow: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300' },
    { type: 'DARK', label: 'Dark', icon: '🌑', glow: 'from-slate-700/30 to-violet-900/30 border-slate-600/40 text-slate-300' },
  ];

  const suggestedUsers = [
    {
      username: 'kai_creates',
      name: 'Kai Tanaka',
      bio: 'Streetwear & Motion Designer 🛹',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    {
      username: 'maya_vibes',
      name: 'Maya Lin',
      bio: 'Cyberpunk & Generative Art 🎨',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
    {
      username: 'elena_sound',
      name: 'Elena Rostova',
      bio: 'Ambient Lo-Fi Producer 🎧',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 p-5 space-y-6 overflow-y-auto border-l border-[#1F2438] bg-[#08090E]/60 backdrop-blur-lg select-none">
      {/* Current User Pill */}
      {user && (
        <div className="flex items-center justify-between p-3 rounded-2xl glass-card border border-white/5">
          <Link href={`/profile/${user.username}`} className="flex items-center gap-3 overflow-hidden group">
            <div className="relative">
              <img
                src={
                  user.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#08090E]" />
            </div>
            <div className="truncate">
              <p className="font-bold text-sm text-white group-hover:text-pink-400 transition-colors truncate">
                {user.name || user.username}
              </p>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
          </Link>
          <Link
            href={`/profile/${user.username}`}
            className="text-xs text-indigo-400 hover:text-pink-400 font-semibold transition-colors"
          >
            Switch
          </Link>
        </div>
      )}

      {/* VIBE SWAP Section */}
      <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Vibe Swap</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-pink-300 font-medium border border-white/5">
            {activeVibe}
          </span>
        </div>
        <p className="text-xs text-slate-400">One tap switches the app mood, feed ranking, and accent.</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {vibeOptions.map((v) => {
            const isSelected = activeVibe === v.type;
            return (
              <button
                key={v.type}
                onClick={() => setVibe(v.type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? `bg-gradient-to-r ${v.glow} shadow-md`
                    : 'bg-[#12141F] border-[#1F2438] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SWAP DAY CARD */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-pink-950/40 border border-pink-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-300 uppercase tracking-wider">
            <Shuffle className="w-3.5 h-3.5" /> Swap Day Match
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Today</span>
        </div>
        {swapDayPartner ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={swapDayPartner.partner.avatarUrl}
                alt={swapDayPartner.partner.username}
                className="w-8 h-8 rounded-full object-cover border border-pink-400/50"
              />
              <div className="text-xs truncate">
                <p className="font-semibold text-white truncate">{swapDayPartner.partner.name}</p>
                <p className="text-slate-400 text-[11px] truncate">@{swapDayPartner.partner.username}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic line-clamp-2">
              "{swapDayPartner.partnerVibeNote || 'Left you a vibe note for today!'}"
            </p>
            <Link
              href="/swap-day"
              className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-semibold group-hover:translate-x-1 transition-transform"
            >
              <span>View highlights swap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Random mutual match pairs up every 24 hours to swap highlights & leave vibe notes.
            </p>
            <Link
              href="/swap-day"
              className="inline-flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-semibold"
            >
              <span>Check today's match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* SWAP DUET CARD */}
      <Link
        href="/duets"
        className="block p-4 rounded-2xl bg-gradient-to-r from-[#12141F] to-[#181B2B] border border-amber-500/20 hover:border-amber-500/40 transition-all group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Swap Duets
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">Split-Screen</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Reply to reel challenges with split-screen side-by-side duets.
        </p>
      </Link>

      {/* Suggested Users */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested For You</span>
          <Link href="/explore" className="text-xs text-indigo-400 hover:underline">
            See All
          </Link>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((su) => {
            const isFollowing = followingStates[su.username];
            return (
              <div key={su.username} className="flex items-center justify-between">
                <Link href={`/profile/${su.username}`} className="flex items-center gap-2.5 overflow-hidden group">
                  <img
                    src={su.avatarUrl}
                    alt={su.username}
                    className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="truncate text-xs">
                    <p className="font-semibold text-white group-hover:text-pink-400 transition-colors truncate">
                      {su.name}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate">@{su.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => toggleFollow(su.username)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                    isFollowing
                      ? 'bg-white/10 text-slate-300 border border-white/10'
                      : 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-sm hover:opacity-95'
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Following
                    </span>
                  ) : (
                    'Follow'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 text-[11px] text-slate-500 space-y-1">
        <p>About • Privacy • Terms • API Docs • Careers</p>
        <p className="font-semibold text-slate-400">© 2026 Swap • Swap moments. Swap vibes.</p>
      </div>
    </aside>
  );
}

