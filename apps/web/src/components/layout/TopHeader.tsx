'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles, PlusSquare, Heart, Shield } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export function TopHeader() {
  const { setCreatePostOpen, setAIAssistOpen } = useUIStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 h-14 bg-[#090A0F]/90 backdrop-blur-md border-b border-[#1F2438] flex items-center justify-between px-4 z-30 select-none">
      {/* Mobile / Header Brand */}
      <div className="flex items-center gap-2">
        <Logo size="sm" />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setAIAssistOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-medium transition-colors"
          title="AI Studio Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">AI Assist</span>
        </button>

        <button
          onClick={() => setCreatePostOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-[#8E96B0] hover:text-white hover:bg-[#161926]"
          title="Create"
        >
          <PlusSquare className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-[#8E96B0] hover:text-white hover:bg-[#161926] relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
          </button>

          {/* Quick Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#12141F] border border-[#1F2438] shadow-2xl p-4 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F2438]">
                <h4 className="font-semibold text-white">Notifications</h4>
                <span className="text-[10px] text-pink-400 font-medium">3 unread</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-full bg-violet-900/40 text-violet-400 mt-0.5">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <p className="text-gray-200">
                      <strong className="text-white">@maya_creates</strong> liked your post
                    </p>
                    <span className="text-[10px] text-gray-500">12m ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-full bg-cyan-900/40 text-cyan-400 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-gray-200">
                      Collab Reel with <strong className="text-white">@elena_vibes</strong> accepted!
                    </p>
                    <span className="text-[10px] text-gray-500">1h ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

