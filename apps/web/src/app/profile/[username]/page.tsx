'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Grid,
  Clock,
  Settings,
  Flame,
  Award,
  Globe,
  Lock,
  EyeOff,
  Shield,
  Check,
} from 'lucide-react';
import { UserProfile, WasteTimeDashboard } from '@swap/shared';
import { useAuthStore } from '../../../store/authStore';
import { useWasteTimeStore } from '../../../store/wasteTimeStore';
import { api } from '../../../lib/api';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, updateUserPreferences } = useAuthStore();
  const { todayMinutes, activeBadge, focusGuardMinutes, setFocusGuardLimit } = useWasteTimeStore();

  const [activeTab, setActiveTab] = useState<'posts' | 'wasted' | 'settings'>('posts');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSavedSettings, setIsSavedSettings] = useState(false);

  useEffect(() => {
    // If viewing own profile
    if (currentUser && currentUser.username === username) {
      setProfile(currentUser);
    } else {
      api
        .get(`/users/${username}`)
        .then((res) => {
          if (res.data.success) {
            setProfile(res.data.data);
            setIsFollowing(res.data.data.isFollowing || false);
          }
        })
        .catch(() => {
          // Mock fallback
          setProfile({
            id: 'demo-p',
            username: username || 'user',
            name: username.replace('_', ' ').toUpperCase(),
            bio: 'Swapping moments, building vibes, and shipping code ⚡',
            website: 'https://swap.app',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            isPrivate: false,
            ghostMode: false, activeVibe: 'CHILL',
            focusGuardMinutes: 30,
            currentStreakCount: 14,
            followersCount: 1420,
            followingCount: 380,
            postsCount: 24,
            reelsCount: 18,
            createdAt: new Date().toISOString(),
          });
        });
    }
  }, [username, currentUser]);

  const toggleFollow = async () => {
    if (!profile) return;
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) await api.post(`/users/${profile.id}/follow`);
      else await api.delete(`/users/${profile.id}/follow`);
    } catch {}
  };

  const isOwner = currentUser?.username === profile?.username;

  // Daily mock history for chart
  const dailyHistory = [
    { day: 'Mon', mins: 45 },
    { day: 'Tue', mins: 75 },
    { day: 'Wed', mins: 90 },
    { day: 'Thu', mins: 30 },
    { day: 'Fri', mins: 110 },
    { day: 'Sat', mins: 85 },
    { day: 'Sun', mins: todayMinutes },
  ];

  const maxMins = Math.max(...dailyHistory.map((d) => d.mins), 120);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-[#12141F] border border-[#1F2438] flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
        <div className="relative">
          <img
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={profile?.username || 'User'}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-violet-500/50 shadow-lg"
          />
          {profile?.currentStreakCount ? (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{profile.currentStreakCount}d</span>
            </div>
          ) : null}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-white">{profile?.name}</h1>
              <p className="text-xs text-gray-400 font-medium">@{profile?.username}</p>
            </div>

            {isOwner ? (
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-1.5 rounded-xl bg-[#161926] border border-[#1F2438] text-xs font-semibold text-gray-200 hover:text-white hover:bg-[#1E2235] transition-colors"
              >
                Edit Profile & Settings
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                className={`px-5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  isFollowing
                    ? 'bg-[#161926] border border-[#1F2438] text-gray-300'
                    : 'bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white shadow-md shadow-pink-600/20'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {profile?.bio && (
            <p className="text-xs text-gray-200 leading-relaxed max-w-md">{profile.bio}</p>
          )}

          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{profile.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 border-t border-[#1F2438] text-xs">
            <div>
              <span className="font-bold text-white block">{profile?.postsCount || 24}</span>
              <span className="text-[11px] text-gray-400">Posts</span>
            </div>
            <div>
              <span className="font-bold text-white block">{profile?.followersCount || 1420}</span>
              <span className="text-[11px] text-gray-400">Followers</span>
            </div>
            <div>
              <span className="font-bold text-white block">{profile?.followingCount || 380}</span>
              <span className="text-[11px] text-gray-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[#1F2438] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts & Reels</span>
        </button>

        <button
          onClick={() => setActiveTab('wasted')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'wasted'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Time Wasted Dashboard</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Anti-Addiction & Privacy</span>
          </button>
        )}
      </div>

      {/* Tab 1: Posts Grid */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
          ].map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden bg-[#12141F] border border-[#1F2438] group cursor-pointer"
            >
              <img
                src={url}
                alt={`post-${i}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Time Wasted Gamified Analytics Dashboard */}
      {activeTab === 'wasted' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#12141F] border border-cyan-500/30 shadow-lg">
              <span className="text-xs text-gray-400 block mb-1">Time Wasted Today</span>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
              <span className="text-[10px] text-gray-500">Across 18 reels</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141F] border border-violet-500/30 shadow-lg">
              <span className="text-xs text-gray-400 block mb-1">Current Procrastinator Badge</span>
              <div className="text-base font-bold text-violet-300 flex items-center gap-1.5 mt-1">
                <span className="text-2xl">{activeBadge.icon}</span>
                <span>{activeBadge.name}</span>
              </div>
              <span className="text-[10px] text-gray-500">Tier earned today</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141F] border border-[#1F2438]">
              <span className="text-xs text-gray-400 block mb-1">Weekly Waste Total</span>
              <div className="text-2xl font-black text-white font-mono">
                {Math.floor((435 + todayMinutes) / 60)}h {(435 + todayMinutes) % 60}m
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Top 5% Swapper 🔥</span>
            </div>
          </div>

          {/* 7-Day History Bar Chart */}
          <div className="p-5 rounded-2xl bg-[#12141F] border border-[#1F2438] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Waste of Time History (Minutes)
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">Total: {435 + todayMinutes}m</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {dailyHistory.map((item) => {
                const heightPercent = Math.min(100, Math.round((item.mins / maxMins) * 100));

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {item.mins}m
                    </span>
                    <div className="w-full bg-[#161926] rounded-t-lg h-32 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400 transition-all duration-500 shadow-md shadow-cyan-500/20"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Addiction & Privacy Settings */}
      {activeTab === 'settings' && isOwner && (
        <div className="p-6 rounded-2xl bg-[#12141F] border border-[#1F2438] space-y-6">
          <h3 className="text-sm font-bold text-white">Anti-Addiction & Privacy Guard Settings</h3>

          {/* Focus Guard Threshold */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Focus Guard Limit (Minutes)
            </label>
            <p className="text-[11px] text-gray-500">
              Trigger a full-screen breathing nudge when your scrolling exceeds this limit.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setFocusGuardLimit(mins);
                    updateUserPreferences({ focusGuardMinutes: mins });
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    focusGuardMinutes === mins
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-transparent'
                      : 'bg-[#161926] border-[#1F2438] text-gray-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Ghost Mode Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1F2438]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <EyeOff className="w-4 h-4 text-violet-400" />
                <span>Ghost Mode</span>
              </div>
              <p className="text-[11px] text-gray-500 max-w-sm">
                Browse profiles and watch stories without leaving a viewer footprint.
              </p>
            </div>
            <button
              onClick={() => updateUserPreferences({ ghostMode: !currentUser?.ghostMode })}
              className={`w-11 h-6 rounded-full relative transition-colors ${
                currentUser?.ghostMode ? 'bg-violet-600' : 'bg-gray-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  currentUser?.ghostMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Private Account Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1F2438]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Lock className="w-4 h-4 text-gray-400" />
                <span>Private Account</span>
              </div>
              <p className="text-[11px] text-gray-500 max-w-sm">
                Only approved followers will be able to see your posts and stories.
              </p>
            </div>
            <button
              onClick={() => updateUserPreferences({ isPrivate: !currentUser?.isPrivate })}
              className={`w-11 h-6 rounded-full relative transition-colors ${
                currentUser?.isPrivate ? 'bg-cyan-500' : 'bg-gray-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  currentUser?.isPrivate ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

