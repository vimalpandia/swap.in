'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, EyeOff, Plus, Heart, Flame, Laugh, Send } from 'lucide-react';
import { StoryTrayItem, StoryItem } from '@swap/shared';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

// Demo initial stories
const defaultStories: StoryTrayItem[] = [
  {
    author: {
      id: 'maya_id',
      username: 'maya_creates',
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    hasUnseen: true,
    stories: [
      {
        id: 's-1',
        mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
        mediaType: 'IMAGE',
        duration: 15,
        caption: 'Late night generative design workstation 💜',
        author: {
          id: 'maya_id',
          username: 'maya_creates',
          name: 'Maya Lin',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        },
        expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isViewed: false,
        viewersCount: 42,
      },
    ],
  },
  {
    author: {
      id: 'elena_id',
      username: 'elena_vibes',
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    hasUnseen: true,
    stories: [
      {
        id: 's-2',
        mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
        mediaType: 'IMAGE',
        duration: 15,
        caption: 'Soundcheck in 10 minutes 🎚️🌴',
        author: {
          id: 'elena_id',
          username: 'elena_vibes',
          name: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
        expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isViewed: false,
        viewersCount: 88,
      },
    ],
  },
  {
    author: {
      id: 'marcus_id',
      username: 'marcus_dev',
      name: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    hasUnseen: false,
    stories: [
      {
        id: 's-3',
        mediaUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
        mediaType: 'IMAGE',
        duration: 15,
        caption: 'Espresso dialed in ☕',
        author: {
          id: 'marcus_id',
          username: 'marcus_dev',
          name: 'Marcus Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        },
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isViewed: true,
        viewersCount: 19,
      },
    ],
  },
];

export function StoryTray() {
  const { user } = useAuthStore();
  const [trays, setTrays] = useState<StoryTrayItem[]>(defaultStories);
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryTrayItem | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch stories from API if available
    api
      .get('/stories/tray')
      .then((res) => {
        if (res.data?.success && res.data.data.length > 0) {
          setTrays(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Story progress timer
  useEffect(() => {
    if (!activeStoryGroup) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (storyIndex < activeStoryGroup.stories.length - 1) {
            setStoryIndex((i) => i + 1);
            return 0;
          } else {
            setActiveStoryGroup(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryGroup, storyIndex]);

  const openStory = (group: StoryTrayItem) => {
    setActiveStoryGroup(group);
    setStoryIndex(0);
    setProgress(0);

    // Record view via API (honors ghost mode on backend)
    const currentStory = group.stories[0];
    if (currentStory) {
      api.post(`/stories/${currentStory.id}/view`, {}).catch(() => {});
    }
  };

  const sendReaction = (emoji: string) => {
    if (activeStoryGroup) {
      const story = activeStoryGroup.stories[storyIndex];
      api.post(`/stories/${story.id}/view`, { reaction: emoji }).catch(() => {});
      setProgress(100); // Progress to next
    }
  };

  return (
    <div className="py-2 overflow-x-auto scrollbar-none select-none">
      <div className="flex items-center gap-4 px-2">
        {/* User's own story create button */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full p-0.5 border border-[#1F2438] bg-[#12141F] flex items-center justify-center">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="You"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center border-2 border-[#090A0F]">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] text-[#8E96B0] group-hover:text-white truncate max-w-[64px]">
            Your story
          </span>
        </div>

        {/* Stories list */}
        {trays.map((tray) => (
          <div
            key={tray.author.id}
            onClick={() => openStory(tray)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
          >
            <div
              className={`w-16 h-16 rounded-full p-[2px] transition-transform duration-200 group-hover:scale-105 ${
                tray.hasUnseen
                  ? 'bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 animate-pulse-slow'
                  : 'bg-[#1F2438]'
              }`}
            >
              <div className="w-full h-full rounded-full p-0.5 bg-[#090A0F]">
                <img
                  src={tray.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={tray.author.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] text-[#8E96B0] group-hover:text-white truncate max-w-[64px]">
              {tray.author.username}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStoryGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2"
          >
            <div className="relative w-full max-w-sm h-[85vh] rounded-3xl overflow-hidden bg-[#12141F] flex flex-col justify-between border border-[#1F2438]">
              {/* Progress bars */}
              <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 z-20">
                {activeStoryGroup.stories.map((s, idx) => (
                  <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{
                        width:
                          idx < storyIndex
                            ? '100%'
                            : idx === storyIndex
                            ? `${progress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="absolute top-7 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStoryGroup.author.avatarUrl || ''}
                    alt={activeStoryGroup.author.username}
                    className="w-8 h-8 rounded-full object-cover border border-cyan-400"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      @{activeStoryGroup.author.username}
                    </p>
                    <span className="text-[10px] text-gray-400">24h Story</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user?.ghostMode && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/50 text-violet-300">
                      <EyeOff className="w-3 h-3" /> Ghost Mode
                    </span>
                  )}
                  <button
                    onClick={() => setActiveStoryGroup(null)}
                    className="p-1 rounded-full text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Story Media */}
              <div className="w-full h-full relative">
                <img
                  src={activeStoryGroup.stories[storyIndex]?.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              </div>

              {/* Story Caption & Quick Reactions */}
              <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
                {activeStoryGroup.stories[storyIndex]?.caption && (
                  <p className="text-sm text-white font-medium drop-shadow-md">
                    {activeStoryGroup.stories[storyIndex].caption}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {['🔥', '❤️', '👏', '😂'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="text-xl p-1.5 rounded-full hover:bg-white/20 transition-transform active:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    👁️ {activeStoryGroup.stories[storyIndex]?.viewersCount || 0} views
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

