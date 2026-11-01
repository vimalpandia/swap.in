'use client';

import React, { useState, useEffect } from 'react';
import { StoryTray } from '../components/feed/StoryTray';
import { MoodFilterBar } from '../components/feed/MoodFilterBar';
import { PostCard } from '../components/feed/PostCard';
import { PostItem, MoodType, VibeType, VIBES } from '@swap/shared';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Sparkles, Flame, Shuffle } from 'lucide-react';
import Link from 'next/link';

// Demo seed posts for immediate offline/online richness
const demoFeedPosts: PostItem[] = [
  {
    id: 'post-demo-1',
    caption: 'Late night generative design sessions hitting differently under neon light. 🌌 What vibe are you on today? #swap #vibes',
    location: 'Tokyo Shibuya Sky',
    mood: 'CURIOUS',
    author: {
      id: 'maya_id',
      username: 'maya_vibes',
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    media: [
      {
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        type: 'IMAGE',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        type: 'IMAGE',
        order: 1,
      },
    ],
    likesCount: 142,
    commentsCount: 18,
    savesCount: 34,
    isLiked: false,
    isSaved: false,
    hashtags: ['#swap', '#vibes', '#cyberpunk'],
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-demo-2',
    caption: 'Studio setup refresh for autumn. Minimalist brutalism with warm amber accents. 🍁 #swap #vibes',
    location: 'Kyoto Design Studio',
    mood: 'CHILL',
    author: {
      id: 'kai_id',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    media: [
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        type: 'IMAGE',
        order: 0,
      },
    ],
    likesCount: 219,
    commentsCount: 14,
    savesCount: 52,
    isLiked: false,
    isSaved: false,
    hashtags: ['#swap', '#vibes'],
    createdAt: new Date(Date.now() - 3600 * 2 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-demo-3',
    caption: 'Quiet morning espresso before shipping the Swap rebrand ☕ Fluid glassmorphism cards and spring physics. #buildinpublic #swap',
    location: 'South Park, San Francisco',
    mood: 'MOTIVATED',
    author: {
      id: 'alex_id',
      username: 'alex_swap',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    media: [
      {
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
        type: 'IMAGE',
        order: 0,
      },
    ],
    likesCount: 310,
    commentsCount: 42,
    savesCount: 65,
    isLiked: true,
    isSaved: false,
    hashtags: ['#buildinpublic', '#chillout', '#swap'],
    createdAt: new Date(Date.now() - 3600 * 4 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<PostItem[]>(demoFeedPosts);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const { activeVibe, setVibe } = useAuthStore();

  useEffect(() => {
    const params: any = { limit: 100 };
    if (selectedMood) params.mood = selectedMood;

    api
      .get('/posts', { params })
      .then((res) => {
        if (res.data?.success && res.data.data?.items?.length > 0) {
          setPosts(res.data.data.items);
        }
      })
      .catch(() => {});
  }, [selectedMood]);

  const filteredPosts = selectedMood
    ? posts.filter((p) => p.mood === selectedMood)
    : posts;

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* 24-Hour Ephemeral Stories Tray */}
      <section className="bg-[#11131E] rounded-2xl border border-[#24283E] p-3 shadow-md glass-card">
        <StoryTray />
      </section>

      {/* Vibe Quick Switcher for Mobile / Quick Access */}
      <section className="xl:hidden flex items-center justify-between p-2.5 rounded-2xl bg-[#11131E] border border-[#24283E] text-xs">
        <span className="flex items-center gap-1.5 font-bold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Vibe:
        </span>
        <div className="flex gap-1.5">
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                activeVibe === v
                  ? 'bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      {/* Swap Shortcuts: Duet & Swap Day */}
      <section className="grid grid-cols-2 gap-2.5 xl:hidden">
        <Link
          href="/duets"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-pink-500/20 text-xs font-semibold text-pink-300 hover:border-pink-500/40 transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-pink-400" /> Swap Duets
          </span>
          <span className="text-[10px] text-pink-400 font-mono">Split</span>
        </Link>
        <Link
          href="/swap-day"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/40 border border-amber-500/20 text-xs font-semibold text-amber-300 hover:border-amber-500/40 transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Shuffle className="w-4 h-4 text-amber-400" /> Swap Day
          </span>
          <span className="text-[10px] text-amber-400 font-mono">24h</span>
        </Link>
      </section>

      {/* Mood-Based Feed Filter */}
      <section>
        <MoodFilterBar selectedMood={selectedMood} onSelectMood={setSelectedMood} />
      </section>

      {/* Feed Posts */}
      <section className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-[#11131E] rounded-2xl border border-[#24283E] text-gray-400">
            <p className="text-sm">No posts found for mood {selectedMood}</p>
            <button
              onClick={() => setSelectedMood(null)}
              className="mt-2 text-xs text-pink-400 font-medium hover:underline"
            >
              Reset mood filter
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </div>
  );
}
