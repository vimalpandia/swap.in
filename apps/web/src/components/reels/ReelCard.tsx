'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Music,
  Users2,
  Plus,
  Check,
} from 'lucide-react';
import { ReelItem } from '@swap/shared';
import { formatNumber } from '../../lib/utils';
import { CommentDrawer } from '../feed/CommentDrawer';
import { useUIStore } from '../../store/uiStore';
import { useWasteTimeStore } from '../../store/wasteTimeStore';
import { api } from '../../lib/api';

interface ReelCardProps {
  reel: ReelItem;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function ReelCard({ reel, isMuted, onToggleMute }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likesCount);
  const [isSaved, setIsSaved] = useState(reel.isSaved);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const { startWatchParty, showToast } = useUIStore();
  const { tickSession } = useWasteTimeStore();

  const { ref, inView } = useInView({
    threshold: 0.65,
  });

  // Autoplay when in view and tick time wasted session
  useEffect(() => {
    if (!videoRef.current) return;

    if (inView) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));

      // Tick watch time every second while visible
      const ticker = setInterval(() => {
        tickSession();
      }, 1000);

      return () => clearInterval(ticker);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, tickSession]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
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

  const toggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));

    if (nextState) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }

    try {
      await api.post(`/reels/${reel.id}/like`);
    } catch {}
  };

  const toggleSave = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      await api.post(`/reels/${reel.id}/save`);
    } catch {}
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(true);
    try {
      await api.post(`/users/${reel.author.id}/follow`);
    } catch {}
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Waste of Time reel by @${reel.author.username}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Reel link copied to clipboard!', 'success');
    }
  };

  const handleStartWatchParty = () => {
    const roomId = `room-${reel.id.slice(0, 8)}`;
    startWatchParty(roomId, reel.id);
  };

  return (
    <div
      ref={ref}
      className="relative w-full h-[calc(100vh-4rem)] max-w-sm sm:max-w-md mx-auto snap-start flex items-center justify-center bg-black rounded-2xl overflow-hidden select-none border border-[#1F2438] shadow-2xl"
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        onDoubleClick={handleDoubleTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Floating Play Indicator when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Floating Heart Burst on Like */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-28 h-28 text-rose-500 fill-current drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Mute/Unmute Button (Top Right) */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors border border-white/10"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-gray-300" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
      </button>

      {/* Right Action Column */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
        {/* Author Avatar with Follow Overlay */}
        <div className="relative">
          <Link href={`/profile/${reel.author.username}`}>
            <img
              src={reel.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={reel.author.username}
              className="w-11 h-11 rounded-full object-cover border-2 border-violet-400 shadow-md"
            />
          </Link>
          {!isFollowing && (
            <button
              onClick={handleFollow}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like */}
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
          <div
            className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-125 ${
              isLiked ? 'text-rose-500' : 'text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">
            {formatNumber(likesCount)}
          </span>
        </button>

        {/* Comment */}
        <button onClick={() => setIsCommentDrawerOpen(true)} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">
            {formatNumber(reel.commentsCount)}
          </span>
        </button>

        {/* Save Bookmark */}
        <button onClick={toggleSave} className="flex flex-col items-center gap-1">
          <div
            className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-colors ${
              isSaved ? 'text-cyan-400' : 'text-white'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">
            {formatNumber(reel.savesCount)}
          </span>
        </button>

        {/* Watch Party Sync Shortcut */}
        <button
          onClick={handleStartWatchParty}
          title="Watch Party with Friends"
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2.5 rounded-full bg-violet-600/80 backdrop-blur-md border border-violet-400 text-white hover:bg-violet-500 transition-colors">
            <Users2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold text-cyan-300 drop-shadow-md">Party</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">Share</span>
        </button>
      </div>

      {/* Bottom Information Overlay */}
      <div className="absolute left-4 right-16 bottom-4 z-20 space-y-2 pointer-events-auto">
        {/* Author & Co-Author */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/profile/${reel.author.username}`}
            className="text-sm font-bold text-white hover:underline drop-shadow-md"
          >
            @{reel.author.username}
          </Link>

          {reel.coAuthor && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-900/80 border border-violet-400 text-violet-200 text-[10px] font-medium">
              <Users2 className="w-3 h-3" /> Collab with @{reel.coAuthor.username}
            </span>
          )}

          {reel.mood && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-medium">
              {reel.mood}
            </span>
          )}
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-xs text-gray-100 line-clamp-2 leading-relaxed drop-shadow-md">
            {reel.caption}
          </p>
        )}

        {/* Audio Marquee with Spinning Vinyl */}
        <div className="flex items-center gap-2 pt-1 text-xs text-gray-300 drop-shadow-md">
          <Music className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-bounce" />
          <span className="truncate max-w-[200px] text-[11px] font-medium">
            {reel.audioName}
          </span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-1 animate-spin ml-auto flex-shrink-0">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        reelId={reel.id}
      />
    </div>
  );
}

