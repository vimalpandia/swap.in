'use client';

import React, { useState, useEffect } from 'react';
import { ReelCard } from '../../components/reels/ReelCard';
import { TimeWastedHUD } from '../../components/reels/TimeWastedHUD';
import { ReelItem, MoodType } from '@swap/shared';
import { useWasteTimeStore } from '../../store/wasteTimeStore';
import { api } from '../../lib/api';

const demoReels: ReelItem[] = [
  {
    id: 'reel-demo-1',
    caption: 'Midnight Tokyo Hyperlapse in rain. POV: swapping vibes through Akihabara at 2 AM. 🌧️✨ #swap #nightlife',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42289-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    duration: 14.5,
    audioName: 'Swap Synthwave - Midnight Rain',
    mood: 'CHILL',
    author: {
      id: 'maya_id',
      username: 'maya_vibes',
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    likesCount: 1420,
    commentsCount: 94,
    sharesCount: 312,
    savesCount: 184,
    viewCount: 8900,
    isLiked: false,
    isSaved: false,
    hashtags: ['#swap', '#nightlife'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-demo-2',
    caption: 'When you tell yourself "just one 15-second reel" and now it is 3:45 AM in Waste of Time 💀 #wasteoftime #vibes',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-scrolling-through-social-media-42354-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    duration: 18.2,
    audioName: 'Original Audio - Elena x Alex',
    mood: 'FUNNY',
    author: {
      id: 'elena_id',
      username: 'elena_sound',
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    coAuthor: {
      id: 'alex_id',
      username: 'alex_swap',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    collabStatus: 'ACCEPTED',
    likesCount: 3890,
    commentsCount: 215,
    sharesCount: 780,
    savesCount: 420,
    viewCount: 19400,
    isLiked: true,
    isSaved: false,
    hashtags: ['#wasteoftime', '#vibes'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-demo-3',
    caption: 'Speedrunning a production bug fix live in terminal. Coffee level: critical ☕⚡ #buildinpublic #swap',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41718-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    duration: 22.0,
    audioName: 'Cyber Ambient Flow - 130 BPM',
    mood: 'MOTIVATED',
    author: {
      id: 'kai_id',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    likesCount: 2150,
    commentsCount: 160,
    sharesCount: 440,
    savesCount: 310,
    viewCount: 12800,
    isLiked: false,
    isSaved: true,
    hashtags: ['#buildinpublic', '#swap'],
    createdAt: new Date().toISOString(),
  },
];

export default function WasteOfTimePage() {
  const [reels, setReels] = useState<ReelItem[]>(demoReels);
  const [isMuted, setIsMuted] = useState(true);
  const { startSession, pauseSession } = useWasteTimeStore();

  useEffect(() => {
    startSession();

    api
      .get('/reels')
      .then((res) => {
        if (res.data?.success && res.data.data?.items?.length > 0) {
          setReels(res.data.data.items);
        }
      })
      .catch(() => {});

    return () => {
      pauseSession();
    };
  }, [startSession, pauseSession]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {/* Time Wasted Meter HUD */}
      <TimeWastedHUD />

      {/* Vertical Snap Reel Feed */}
      {reels.map((reel) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />
      ))}
    </div>
  );
}
