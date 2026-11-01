'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Clock, Hourglass, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const tabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Waste of Time', href: '/reels', icon: Clock, highlight: true },
    { label: 'Capsules', href: '/capsules', icon: Hourglass },
    { label: 'Chat', href: '/chat', icon: MessageCircle },
    { label: 'Profile', href: user ? `/profile/${user.username}` : '/auth/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090A0F]/95 backdrop-blur-md border-t border-[#1F2438] flex items-center justify-around px-2 z-50 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors',
              isActive ? 'text-pink-400 font-semibold' : 'text-[#8E96B0] hover:text-white',
              tab.highlight && !isActive && 'text-amber-400'
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive && 'scale-110',
                  tab.highlight && 'text-amber-400 animate-pulse-slow'
                )}
              />
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[65px]">
              {tab.label === 'Waste of Time' ? 'Time Waste' : tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

