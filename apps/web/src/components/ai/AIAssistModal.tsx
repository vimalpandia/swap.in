'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Copy, Check, Music, Hash } from 'lucide-react';
import { MoodType } from '@swap/shared';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';

export function AIAssistModal() {
  const { isAIAssistOpen, setAIAssistOpen } = useUIStore();
  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState<MoodType>('CHILL');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    caption: string;
    hashtags: string[];
    suggestedAudio: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/caption', {
        prompt: prompt.trim(),
        mood,
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch {
      // Fallback generator
      setResult({
        caption: `Swapping vibes and moments ⚡ — ${prompt}. Building the future and sharing the energy.`,
        hashtags: ['#swap', `#${mood.toLowerCase()}`, '#wasteoftime', '#creatives'],
        suggestedAudio: 'Swap Lo-Fi - Midnight Rain',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `${result.caption}\n\n${result.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAIAssistOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-swap-card border border-swap-border rounded-3xl p-6 shadow-2xl relative"
        >
          <button
            onClick={() => setAIAssistOpen(false)}
            className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-swap-gradient text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Swap AI Studio Assistant</h3>
              <p className="text-xs text-gray-400">Generate viral captions, hashtags, and audio pairings</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">What are you creating?</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Neon cyberpunk street photography in Tokyo rain at 2 AM"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-swap-surface border border-swap-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Choose Mood Target</label>
              <div className="grid grid-cols-4 gap-2">
                {(['CHILL', 'FUNNY', 'MOTIVATED', 'CURIOUS'] as MoodType[]).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMood(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      mood === m
                        ? 'bg-swap-gradient text-white border-transparent shadow-md'
                        : 'bg-swap-surface border-swap-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 rounded-xl bg-swap-gradient text-white font-bold text-xs hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Consulting Swap AI...' : 'Generate AI Caption & Suggestions'}</span>
            </button>
          </form>

          {/* AI Result Card */}
          {result && (
            <div className="mt-5 p-4 rounded-2xl bg-swap-surface border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-pink-400 font-bold">
                <span>AI Suggested Result</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed font-sans">{result.caption}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-swap-border text-[11px] text-gray-400">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Track: <strong className="text-white">{result.suggestedAudio}</strong></span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
