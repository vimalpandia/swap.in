'use client';

import React, { useState, useEffect } from 'react';
import { Hourglass, Plus, Sparkles } from 'lucide-react';
import { CapsuleCard } from '../../components/capsules/CapsuleCard';
import { CreateCapsuleModal } from '../../components/capsules/CreateCapsuleModal';
import { TimeCapsuleItem } from '@swap/shared';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';

const demoCapsules: TimeCapsuleItem[] = [
  {
    id: 'cap-demo-1',
    title: 'Swap 3.0 Roadmap & Design Tokens',
    caption: 'Secret roadmap reveals, Figma master tokens, and our next feature drafts!',
    mediaUrl: null, // Locked
    author: {
      id: 'alex_id',
      username: 'alex_swap',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    unlocksAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    isUnlocked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cap-demo-2',
    title: 'Neon Tokyo Wallpaper Pack [UNLOCKED]',
    caption: 'Surprise! Here is the high-res 4K cyberpunk wallpaper pack curated from our midnight shoots!',
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    author: {
      id: 'maya_id',
      username: 'maya_creates',
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    unlocksAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    isUnlocked: true,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
];

export default function TimeCapsulesPage() {
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>(demoCapsules);
  const { setCreateCapsuleOpen } = useUIStore();

  const fetchCapsules = () => {
    api
      .get('/capsules')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setCapsules(res.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-amber-400" />
            Time Capsule Vault
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Encrypt memories and schedule them to auto-unlock on future dates.
          </p>
        </div>

        <button
          onClick={() => setCreateCapsuleOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-swap-gradient text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Seal Capsule</span>
        </button>
      </div>

      {/* Capsule List */}
      <div className="space-y-4">
        {capsules.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} />
        ))}
      </div>

      {/* Modal */}
      <CreateCapsuleModal onCreated={fetchCapsules} />
    </div>
  );
}
