'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, MapPin, Sparkles, Plus, Trash2 } from 'lucide-react';
import { MoodType } from '@swap/shared';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';

export function CreatePostModal({ onCreated }: { onCreated?: () => void }) {
  const { isCreatePostOpen, setCreatePostOpen, setAIAssistOpen, showToast } = useUIStore();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState<MoodType | ''>('CHILL');
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addImageUrl = () => {
    if (newUrlInput.trim()) {
      setImageUrls((prev) => [...prev, newUrlInput.trim()]);
      setNewUrlInput('');
    }
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      showToast('Please provide at least one image URL', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/posts', {
        caption: caption.trim() || null,
        location: location.trim() || null,
        mood: mood || null,
        media: imageUrls.map((url, order) => ({
          url,
          type: 'IMAGE',
          order,
        })),
      });

      setCaption('');
      setLocation('');
      setCreatePostOpen(false);
      showToast('Post published to Swap!', 'success');
      if (onCreated) onCreated();
    } catch {
      showToast('Failed to publish post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreatePostOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-swap-card border border-swap-border rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setCreatePostOpen(false)}
            className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-base font-bold text-white mb-4">Create New Swap Post</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Preview & URLs */}
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">
                Media Photos ({imageUrls.length})
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-swap-border">
                    <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <input
                  type="url"
                  placeholder="Paste additional image URL..."
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 bg-swap-surface border border-swap-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-3 py-2 rounded-xl bg-swap-border text-white hover:bg-swap-border/80 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Caption & AI Assist Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Caption</label>
                <button
                  type="button"
                  onClick={() => setAIAssistOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-pink-400 hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> AI Caption Assistant
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Share moments, share vibes... What are you creating?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-swap-surface border border-swap-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            {/* Location & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1.5">Location</label>
                <div className="flex items-center gap-2 bg-swap-surface border border-swap-border rounded-xl px-3 py-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <input
                    type="text"
                    placeholder="e.g. Neo Tokyo, Marina SF"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1.5">Mood Tag</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as any)}
                  className="w-full bg-swap-surface border border-swap-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">None</option>
                  <option value="CHILL">Chill</option>
                  <option value="FUNNY">Funny</option>
                  <option value="MOTIVATED">Motivated</option>
                  <option value="CURIOUS">Curious</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || imageUrls.length === 0}
              className="w-full py-3 rounded-xl bg-swap-gradient text-white font-bold text-xs hover:opacity-95 disabled:opacity-40 shadow-lg shadow-pink-600/20 transition-all mt-2"
            >
              {isSubmitting ? 'Sharing Post...' : 'Publish Swap Post'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
