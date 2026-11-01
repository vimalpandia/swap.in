'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Send, Users2, Link2, Check } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../lib/socket';

export function WatchPartyModal() {
  const { activeWatchPartyRoom, activeWatchPartyReelId, closeWatchParty } = useUIStore();
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'System', text: 'Watch Party active! Video playback is synchronized across all peers.' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (!activeWatchPartyRoom) return;

    const socket = getSocket();
    socket.emit('join_watch_party', {
      roomId: activeWatchPartyRoom,
      reelId: activeWatchPartyReelId,
    });

    socket.on('watch_party_state', (state: any) => {
      if (videoRef.current) {
        if (Math.abs(videoRef.current.currentTime - state.currentTime) > 1.5) {
          videoRef.current.currentTime = state.currentTime;
        }
        if (state.isPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else if (!state.isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    });

    socket.on('user_joined_party', (data: any) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'System', text: `@${data.username} joined the party! 🍿` },
      ]);
    });

    return () => {
      socket.off('watch_party_state');
      socket.off('user_joined_party');
    };
  }, [activeWatchPartyRoom, activeWatchPartyReelId]);

  const togglePlayback = () => {
    if (!videoRef.current || !activeWatchPartyRoom) return;
    const socket = getSocket();
    const nextState = !isPlaying;

    if (nextState) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
    setIsPlaying(nextState);

    socket.emit('watch_party_sync', {
      roomId: activeWatchPartyRoom,
      currentTime: videoRef.current.currentTime,
      isPlaying: nextState,
    });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: user?.username || 'You', text: inputMsg.trim() },
    ]);
    setInputMsg('');
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeWatchPartyRoom) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl h-[90vh] bg-[#12141F] border border-[#1F2438] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
        >
          {/* Synchronized Video Stage */}
          <div className="flex-1 bg-black relative flex flex-col justify-center items-center">
            <video
              ref={videoRef}
              src="https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-scrolling-through-social-media-42354-large.mp4"
              loop
              autoPlay
              playsInline
              className="max-h-[60vh] md:max-h-full w-auto object-contain cursor-pointer"
              onClick={togglePlayback}
            />

            {/* Play/Pause Control Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-[#090A0F]/80 backdrop-blur-md border border-[#1F2438]">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-white block">Watch Party Sync</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Room: {activeWatchPartyRoom}</span>
                </div>
              </div>

              <button
                onClick={copyInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161926] border border-[#1F2438] text-xs text-gray-300 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Invite'}</span>
              </button>
            </div>
          </div>

          {/* Synchronized Chat Sidebar */}
          <div className="w-full md:w-80 h-1/2 md:h-full bg-[#090A0F] border-t md:border-t-0 md:border-l border-[#1F2438] flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-[#1F2438] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Party Chat</h4>
              </div>
              <button
                onClick={closeWatchParty}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className="bg-[#12141F] p-2.5 rounded-xl border border-[#1F2438]">
                  <span className="font-bold text-cyan-400 block mb-0.5">@{m.sender}</span>
                  <p className="text-gray-200">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-[#1F2438] flex gap-2">
              <input
                type="text"
                placeholder="React in sync..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-[#161926] border border-[#1F2438] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

