'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PostItem } from '@swap/shared';
import { formatTimeAgo, formatNumber } from '../../lib/utils';
import { CommentDrawer } from './CommentDrawer';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/uiStore';

interface PostCardProps {
  post: PostItem;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const { showToast } = useUIStore();

  const toggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));

    if (nextState) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }

    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      // Optimistic state preserved
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      toggleLike();
    } else {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  const toggleSave = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      await api.post(`/posts/${post.id}/save`);
    } catch {}
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.author.username} on Swap`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Post link copied to clipboard!', 'success');
    }
  };

  const mediaList = post.media || [];
  const currentMedia = mediaList[currentMediaIdx] || { url: '', type: 'IMAGE' };

  return (
    <article className="rounded-2xl bg-[#12141F] border border-[#1F2438] overflow-hidden select-none transition-all hover:border-[#2A314D] mb-5">
      {/* Post Header */}
      <div className="p-3.5 flex items-center justify-between">
        <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
          <img
            src={post.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={post.author.username}
            className="w-9 h-9 rounded-full object-cover border border-violet-500/40 transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                @{post.author.username}
              </span>
              <span className="text-[10px] text-gray-500">• {formatTimeAgo(post.createdAt)}</span>
            </div>
            {post.location && (
              <span className="flex items-center gap-1 text-[11px] text-[#8E96B0]">
                <MapPin className="w-3 h-3 text-cyan-400" /> {post.location}
              </span>
            )}
          </div>
        </Link>

        {post.mood && (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 font-medium">
            {post.mood}
          </span>
        )}
      </div>

      {/* Media Carousel with Double-Tap to Like */}
      <div
        onDoubleClick={handleDoubleTap}
        className="relative w-full aspect-[4/3] sm:aspect-square bg-black overflow-hidden flex items-center justify-center cursor-pointer"
      >
        <img
          src={currentMedia.url}
          alt={post.caption || 'Swap post'}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Floating Heart Burst on Like */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-current drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Prev / Next Controls if multiple images */}
        {mediaList.length > 1 && (
          <>
            {currentMediaIdx > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIdx((i) => i - 1);
                }}
                className="absolute left-2.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {currentMediaIdx < mediaList.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIdx((i) => i + 1);
                }}
                className="absolute right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Pagination dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {mediaList.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentMediaIdx ? 'w-4 bg-cyan-400' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-transform active:scale-125 ${
                isLiked ? 'text-rose-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{formatNumber(likesCount)}</span>
            </button>

            <button
              onClick={() => setIsCommentDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{formatNumber(commentsCount)}</span>
            </button>

            <button
              onClick={handleShare}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={toggleSave}
            className={`transition-colors ${
              isSaved ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-xs text-gray-200 leading-relaxed">
            <strong className="text-white font-semibold mr-1.5">@{post.author.username}</strong>
            {post.caption}
          </p>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-cyan-400/90 hover:underline cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* View Comments Shortcut */}
        {commentsCount > 0 && (
          <button
            onClick={() => setIsCommentDrawerOpen(true)}
            className="text-[11px] text-[#8E96B0] hover:text-white block pt-1"
          >
            View all {commentsCount} comments
          </button>
        )}
      </div>

      {/* Interactive Nested Comments Drawer */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        postId={post.id}
      />
    </article>
  );
}

