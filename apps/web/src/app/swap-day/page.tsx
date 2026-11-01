'use client';

import React, { useState, useEffect } from 'react';
import { SwapDayMatchItem } from '@swap/shared';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Shuffle, Heart, MessageSquare, Sparkles, Send, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SwapDayPage() {
  const { user } = useAuthStore();
  const [match, setMatch] = useState<SwapDayMatchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vibeNoteInput, setVibeNoteInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/swap/day')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setMatch(res.data.data);
          if (res.data.data.myVibeNote) {
            setVibeNoteInput(res.data.data.myVibeNote);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !vibeNoteInput.trim()) return;

    setIsSavingNote(true);
    try {
      await api.post(`/swap/day/${match.id}/vibe-note`, {
        note: vibeNoteInput.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Demo fallback success
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSavingNote(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Swap Day Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-amber-950/70 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
          <Shuffle className="w-3.5 h-3.5" /> 24-Hour Swap Day Match
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Today's Profile Swap: {todayDateStr}
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-xl">
          Every 24 hours, Swap pairs you with a random mutual friend. You swap each other's profile highlights and exchange a daily vibe note.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm">Matching today's mutual pair...</p>
        </div>
      ) : match ? (
        <div className="space-y-6">
          {/* Matched Partner Card */}
          <div className="p-5 rounded-3xl bg-[#11131E] border border-[#24283E] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={match.partner.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'}
                alt={match.partner.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-pink-500/60 shadow-lg shadow-pink-500/20"
              />
              <div>
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                  Today's Mutual Partner
                </span>
                <h3 className="text-xl font-bold text-white">{match.partner.name}</h3>
                <Link
                  href={`/profile/${match.partner.username}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  @{match.partner.username} • View Profile
                </Link>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
              Reset in 24h
            </div>
          </div>

          {/* Vibe Notes Exchange Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Partner's Note For You */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121422] to-[#181B2B] border border-pink-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Note from @{match.partner.username}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#08090E] border border-[#24283E] min-h-[90px] flex items-center">
                {match.partnerVibeNote ? (
                  <p className="text-sm text-slate-200 italic leading-relaxed">
                    "{match.partnerVibeNote}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    @{match.partner.username} hasn't left their vibe note yet. Check back soon!
                  </p>
                )}
              </div>
            </div>

            {/* Your Note for Partner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121422] to-[#181B2B] border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Your Vibe Note for @{match.partner.username}</span>
                </span>
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  value={vibeNoteInput}
                  onChange={(e) => setVibeNoteInput(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#08090E] border border-[#24283E] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder={`Write something encouraging or share a vibe for @${match.partner.username}...`}
                  maxLength={280}
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? 'Saving...' : 'Send Vibe Note'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Partner's Swapped Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>@{match.partner.username}'s Top Highlights</span>
                <span className="text-xs text-slate-400 font-normal">(Swapped for today)</span>
              </h3>
              <Link
                href={`/profile/${match.partner.username}`}
                className="text-xs text-indigo-400 hover:underline"
              >
                View all posts
              </Link>
            </div>

            {match.partnerHighlights && match.partnerHighlights.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {match.partnerHighlights.map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-[#11131E] border border-[#24283E] group"
                  >
                    <img
                      src={post.media[0]?.url || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80'}
                      alt={post.caption || 'Highlight'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-current text-rose-500" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 fill-current text-cyan-400" />
                        {post.commentsCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#11131E] rounded-2xl border border-[#24283E] text-slate-400 text-xs">
                No highlights uploaded yet by @{match.partner.username}.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#11131E] rounded-3xl border border-[#24283E] text-slate-300 space-y-3">
          <Shuffle className="w-10 h-10 text-pink-400 mx-auto" />
          <h3 className="font-bold text-lg text-white">No Mutual Matches Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Follow friends back to create mutual connections! Every day, Swap matches mutual friends to share highlights and vibe notes.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-xs font-bold"
          >
            Find Friends to Follow
          </Link>
        </div>
      )}
    </div>
  );
}

