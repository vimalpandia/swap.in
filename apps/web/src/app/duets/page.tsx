'use client';

import React, { useState, useEffect } from 'react';
import { SwapChallengeItem, ReelItem } from '@swap/shared';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Flame, Play, Pause, Volume2, VolumeX, Send, Plus, CheckCircle2, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

const demoDuets: SwapChallengeItem[] = [
  {
    id: 'duet-1',
    prompt: 'Show me your 10-second studio workflow 🎨',
    initiator: {
      id: 'u-kai',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    recipient: {
      id: 'u-maya',
      username: 'maya_vibes',
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
    initiatorReel: {
      id: 'reel-kai',
      caption: 'Dropping the 10-second motion workflow 🛹',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41718-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      duration: 12,
      audioName: 'Cyber Ambient Flow - 130 BPM',
      mood: 'MOTIVATED',
      author: {
        id: 'u-kai',
        username: 'kai_creates',
        name: 'Kai Tanaka',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      },
      likesCount: 342,
      commentsCount: 28,
      sharesCount: 15,
      savesCount: 44,
      viewCount: 2150,
      isLiked: false,
      isSaved: false,
      hashtags: ['#swap', '#duet'],
      createdAt: new Date().toISOString(),
    },
    replyReel: {
      id: 'reel-maya',
      caption: 'Replying with my 3D rendering pipeline! 🚀',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42289-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      duration: 12,
      audioName: 'Cyber Ambient Flow - 130 BPM',
      mood: 'MOTIVATED',
      author: {
        id: 'u-maya',
        username: 'maya_vibes',
        name: 'Maya Lin',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      },
      likesCount: 418,
      commentsCount: 39,
      sharesCount: 24,
      savesCount: 67,
      viewCount: 1840,
      isLiked: true,
      isSaved: false,
      hashtags: ['#swap', '#duet'],
      createdAt: new Date().toISOString(),
    },
    status: 'COMPLETED',
    isDuet: true,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export default function DuetsPage() {
  const { user } = useAuthStore();
  const [duets, setDuets] = useState<SwapChallengeItem[]>(demoDuets);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [recipientInput, setRecipientInput] = useState('kai_creates');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    api
      .get('/swap/duets')
      .then((res) => {
        if (res.data?.success && res.data.data?.duets?.length > 0) {
          setDuets(res.data.data.duets);
        }
      })
      .catch(() => {});
  }, []);

  const togglePlay = (id: string) => {
    setIsPlaying((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsSending(true);
    try {
      // In production calls /api/v1/swap/challenge
      await api.post('/swap/challenge', {
        prompt: promptInput,
        recipientId: recipientInput,
        initiatorReelId: duets[0]?.initiatorReel?.id || 'reel-1',
      });
      setSuccessMsg('Swap Challenge sent! Your friend will be notified to reply.');
      setPromptInput('');
      setTimeout(() => {
        setSuccessMsg('');
        setShowInviteModal(false);
      }, 2000);
    } catch {
      setSuccessMsg('Challenge sent in demo mode! 🚀');
      setTimeout(() => {
        setSuccessMsg('');
        setShowInviteModal(false);
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-pink-950/80 border border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-pink-400" /> Swap Signature Feature
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Swap Challenge & Duets
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Send a friend a reel prompt. When they reply, watch both reels synchronized side-by-side as a split-screen duet!
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-600/25 hover:opacity-95 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Send Challenge</span>
          </button>
        </div>
      </div>

      {/* Duet Feed (Split-Screen Reels) */}
      <div className="space-y-8">
        {duets.map((duet) => (
          <div
            key={duet.id}
            className="rounded-3xl bg-[#11131E] border border-[#24283E] overflow-hidden shadow-xl"
          >
            {/* Challenge Prompt Header */}
            <div className="p-4 sm:p-5 border-b border-[#24283E] flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                  Challenge Prompt
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">"{duet.prompt}"</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Challenged by <strong className="text-indigo-300">@{duet.initiator.username}</strong></span>
                  <span>•</span>
                  <span>Replied by <strong className="text-pink-300">@{duet.recipient.username}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Split Screen Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#24283E] bg-black">
              {/* Left Screen: Initiator Reel */}
              <div className="relative aspect-[9/16] sm:aspect-[4/5] bg-black flex items-center justify-center overflow-hidden group">
                {duet.initiatorReel && (
                  <>
                    <video
                      src={duet.initiatorReel.videoUrl}
                      poster={duet.initiatorReel.thumbnailUrl}
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Author Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <img
                        src={duet.initiator.avatarUrl || ''}
                        alt={duet.initiator.username}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">@{duet.initiator.username}</span>
                      <span className="text-[10px] text-indigo-300 font-semibold px-1.5 py-0.2 bg-indigo-500/20 rounded-md">Original</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                      <p className="line-clamp-2">{duet.initiatorReel.caption}</p>
                      <p className="text-[10px] text-slate-400 mt-1">🎵 {duet.initiatorReel.audioName}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Right Screen: Reply Reel */}
              <div className="relative aspect-[9/16] sm:aspect-[4/5] bg-black flex items-center justify-center overflow-hidden group">
                {duet.replyReel && (
                  <>
                    <video
                      src={duet.replyReel.videoUrl}
                      poster={duet.replyReel.thumbnailUrl}
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Author Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <img
                        src={duet.recipient.avatarUrl || ''}
                        alt={duet.recipient.username}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">@{duet.recipient.username}</span>
                      <span className="text-[10px] text-pink-300 font-semibold px-1.5 py-0.2 bg-pink-500/20 rounded-md">Duet Reply</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                      <p className="line-clamp-2">{duet.replyReel.caption}</p>
                      <p className="text-[10px] text-slate-400 mt-1">🎵 {duet.replyReel.audioName}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Duet Interaction Footer */}
            <div className="p-4 flex items-center justify-between text-xs text-slate-300 border-t border-[#24283E]">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-semibold">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>760 Duet Likes</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white">
                  <Share2 className="w-4 h-4" />
                  <span>Share Split-Screen</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed Duet
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#11131E] border border-pink-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#24283E]">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-pink-400" /> Send Swap Challenge
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm text-center font-semibold">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSendChallenge} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Friend's Username
                  </label>
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-[#24283E] text-white text-sm focus:outline-none focus:border-pink-500"
                    placeholder="e.g. kai_creates"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Reel Challenge Prompt
                  </label>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-[#24283E] text-white text-sm focus:outline-none focus:border-pink-500"
                    placeholder="e.g. Drop your favorite 10-second transition! 🎬"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white text-sm font-bold shadow-lg shadow-pink-600/20 hover:opacity-95 transition-all"
                  >
                    {isSending ? 'Sending...' : 'Send Challenge'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

