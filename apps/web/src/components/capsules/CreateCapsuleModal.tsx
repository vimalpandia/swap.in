'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hourglass, Calendar, Image as ImageIcon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';

export function CreateCapsuleModal({ onCreated }: { onCreated?: () => void }) {
  const { isCreateCapsuleOpen, setCreateCapsuleOpen, showToast } = useUIStore();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [daysFromNow, setDaysFromNow] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const unlocksAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();

    try {
      await api.post('/capsules', {
        title: title.trim(),
        caption: caption.trim() || null,
        mediaUrl: mediaUrl.trim() || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'IMAGE',
        unlocksAt,
      });

      setTitle('');
      setCaption('');
      setMediaUrl('');
      setCreateCapsuleOpen(false);
      showToast('Time Capsule sealed into the digital vault! ⏳', 'success');
      if (onCreated) onCreated();
    } catch {
      showToast('Failed to seal time capsule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreateCapsuleOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-[#12141F] border border-[#1F2438] rounded-3xl p-6 shadow-2xl relative"
        >
          <button
            onClick={() => setCreateCapsuleOpen(false)}
            className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/30">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Seal a Time Capsule</h3>
              <p className="text-xs text-gray-400">Lock memories & media to unlock in the future</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Capsule Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Open on New Year's Eve / My 25th Birthday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161926] border border-[#1F2438] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Secret Message / Caption</label>
              <textarea
                rows={3}
                placeholder="This message will remain encrypted and masked until the timer hits zero..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#161926] border border-[#1F2438] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Photo / Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-[#161926] border border-[#1F2438] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">
                Unlock Timer: <span className="text-cyan-400 font-bold">{daysFromNow} Days</span> from now
              </label>
              <input
                type="range"
                min={1}
                max={90}
                value={daysFromNow}
                onChange={(e) => setDaysFromNow(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Tomorrow (1d)</span>
                <span>1 Month (30d)</span>
                <span>3 Months (90d)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-xs hover:opacity-95 disabled:opacity-40 shadow-lg shadow-violet-600/20 transition-all mt-2"
            >
              {isSubmitting ? 'Sealing Capsule...' : '🔒 Seal Capsule & Start Countdown'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

