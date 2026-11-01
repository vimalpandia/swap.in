'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Clock,
  Hourglass,
  MessageCircle,
  Sparkles,
  PlusSquare,
  User,
  EyeOff,
  LogOut,
  Flame,
  Shuffle,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useAuthStore } from '../../store/authStore';
import { useWasteTimeStore } from '../../store/wasteTimeStore';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, updateUserPreferences, activeVibe } = useAuthStore();
  const { todayMinutes, activeBadge } = useWasteTimeStore();
  const { setCreatePostOpen, setAIAssistOpen } = useUIStore();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    {
      label: 'Waste of Time',
      href: '/reels',
      icon: Clock,
      highlight: true,
      badge: `${todayMinutes}m`,
    },
    {
      label: 'Swap Duets',
      href: '/duets',
      icon: Flame,
      duetHighlight: true,
    },
    {
      label: 'Swap Day',
      href: '/swap-day',
      icon: Shuffle,
    },
    { label: 'Time Capsules', href: '/capsules', icon: Hourglass },
    {
      label: 'Chat',
      href: '/chat',
      icon: MessageCircle,
      streak: user?.currentStreakCount ? `${user.currentStreakCount}🔥` : undefined,
    },
    {
      label: 'Profile',
      href: user ? `/profile/${user.username}` : '/auth/login',
      icon: User,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#08090E] border-r border-[#1F2438] p-4 z-40 select-none">
      {/* Brand Header */}
      <div className="py-3 px-3 mb-2">
        <Logo size="md" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 via-pink-600/20 to-amber-500/10 text-white border border-pink-500/30 font-semibold shadow-lg shadow-pink-500/5'
                  : 'text-[#8E96B0] hover:text-white hover:bg-[#121422]'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-110',
                    item.highlight && 'text-amber-400',
                    item.duetHighlight && 'text-pink-400',
                    isActive ? 'text-pink-400' : ''
                  )}
                />
                <span
                  className={cn(
                    item.highlight ? 'text-amber-300 font-semibold' : '',
                    item.duetHighlight ? 'text-pink-300 font-semibold' : ''
                  )}
                >
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 font-mono font-bold">
                  {item.badge}
                </span>
              )}
              {item.streak && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-pink-950/60 border border-pink-500/30 text-pink-300 font-mono font-bold">
                  {item.streak}
                </span>
              )}
            </Link>
          );
        })}

        {/* Action Buttons */}
        <div className="pt-3 space-y-2">
          <button
            onClick={() => setCreatePostOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-semibold text-sm shadow-md shadow-pink-600/20 hover:opacity-95 transition-all"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create</span>
          </button>

          <button
            onClick={() => setAIAssistOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#121422] border border-pink-500/30 text-pink-300 hover:text-white hover:border-pink-400 font-medium text-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Studio Assist</span>
          </button>
        </div>
      </nav>

      {/* Time Wasted & Anti-Addiction Meter HUD */}
      <div className="pt-3 pb-1 border-t border-[#1F2438] space-y-2">
        <div className="p-3 rounded-xl bg-[#11131E] border border-[#1F2438]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#8E96B0] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Time Wasted
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1F2438]/60 text-slate-400">
            <span>Badge: {activeBadge.icon} {activeBadge.name}</span>
          </div>
        </div>

        {/* Ghost Mode Toggle */}
        {user && (
          <div className="flex items-center justify-between px-2 py-1 text-xs text-[#8E96B0]">
            <span className="flex items-center gap-1.5">
              <EyeOff className={cn('w-3.5 h-3.5', user.ghostMode ? 'text-pink-400' : 'text-gray-500')} />
              Ghost Mode
            </span>
            <button
              onClick={() => updateUserPreferences({ ghostMode: !user.ghostMode })}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative',
                user.ghostMode ? 'bg-gradient-to-r from-indigo-500 to-pink-500' : 'bg-gray-800'
              )}
            >
              <span
                className={cn(
                  'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform',
                  user.ghostMode ? 'left-5' : 'left-1'
                )}
              />
            </button>
          </div>
        )}

        {/* User Mini Bar / Logout */}
        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={
                  user.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover border border-pink-500/40"
              />
              <div className="truncate text-xs">
                <p className="font-semibold text-white truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-[#8E96B0] hover:text-rose-400 p-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
