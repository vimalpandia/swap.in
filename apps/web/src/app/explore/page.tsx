'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Flame, TrendingUp, Compass, Play, Hash } from 'lucide-react';
import { api } from '../../lib/api';

const trendingTags = [
  { name: 'swap', count: '14.2k' },
  { name: 'WasteOfTime', count: '9.8k' },
  { name: 'nightlife', count: '7.1k' },
  { name: 'cyberpunk', count: '6.4k' },
  { name: 'buildinpublic', count: '5.2k' },
  { name: 'vibes', count: '4.8k' },
];

const exploreGridItems = [
  {
    id: 'e-1',
    type: 'VIDEO',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    likes: '1.4k',
    isReel: true,
  },
  {
    id: 'e-2',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    likes: '890',
  },
  {
    id: 'e-3',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    likes: '720',
  },
  {
    id: 'e-4',
    type: 'VIDEO',
    url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    likes: '3.8k',
    isReel: true,
  },
  {
    id: 'e-5',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    likes: '512',
  },
  {
    id: 'e-6',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    likes: '940',
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      api
        .get(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => {
          if (res.data.success) {
            setSearchResults(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-6 select-none">
      {/* Debounced Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search creators, #hashtags, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-swap-surface border border-swap-border rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Search Results Dropdown/Overlay */}
      {searchResults.length > 0 && (
        <div className="bg-swap-surface border border-swap-border rounded-2xl p-3 divide-y divide-swap-border">
          <h4 className="text-xs font-bold text-gray-400 pb-2">Users Found</h4>
          {searchResults.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 py-2.5 px-2 hover:bg-swap-card rounded-xl transition-colors"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-pink-400/30"
              />
              <div>
                <span className="text-xs font-bold text-white block">@{user.username}</span>
                <span className="text-[11px] text-gray-400">{user.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Trending Hashtags Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-white">Trending in Swap</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {trendingTags.map((tag) => (
            <div
              key={tag.name}
              className="p-3 rounded-xl bg-swap-surface border border-swap-border hover:border-pink-500/40 transition-colors cursor-pointer group"
            >
              <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-pink-400" />
                {tag.name}
              </span>
              <span className="text-[10px] text-gray-500">{tag.count} posts & reels</span>
            </div>
          ))}
        </div>
      </section>

      {/* Discovery Grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Explore Discovery Grid</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {exploreGridItems.map((item) => (
            <Link
              key={item.id}
              href={item.isReel ? '/reels' : '/'}
              className="relative aspect-square rounded-2xl overflow-hidden bg-swap-surface border border-swap-border group cursor-pointer"
            >
              <img
                src={item.url}
                alt="explore item"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                <span>❤️ {item.likes}</span>
              </div>
              {item.isReel && (
                <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/60 text-white">
                  <Play className="w-3 h-3 fill-current" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
