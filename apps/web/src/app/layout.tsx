'use client';

import './globals.css';
import React, { useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { RightSidebar } from '../components/layout/RightSidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { TopHeader } from '../components/layout/TopHeader';
import { FocusGuardModal } from '../components/layout/FocusGuardModal';
import { AIAssistModal } from '../components/ai/AIAssistModal';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { WatchPartyModal } from '../components/reels/WatchPartyModal';
import { Toast } from '../components/layout/Toast';
import { useAuthStore } from '../store/authStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Swap - Swap moments. Swap vibes.</title>
        <meta
          name="description"
          content="Swap moments. Swap vibes. Instagram-style social platform with Waste of Time reels, split-screen Swap Duets, daily Swap Day mutual matches, and Vibe Swap moods."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content="Swap - Swap moments. Swap vibes." />
        <meta property="og:description" content="Capture moments. Swap reels. Match daily highlights and swap your vibe." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[#08090E] text-slate-100 min-h-screen flex flex-col md:flex-row antialiased font-sans">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Main Feed Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 min-h-screen">
          {/* Mobile Top Header */}
          <div className="md:hidden">
            <TopHeader />
          </div>

          <main className="flex-1 min-w-0">{children}</main>
        </div>

        {/* Desktop Right Sidebar (suggestions & Swap Day & Vibe Swap) */}
        <RightSidebar />

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Global Modals & Feature HUDs */}
        <FocusGuardModal />
        <AIAssistModal />
        <CreatePostModal />
        <WatchPartyModal />
        <Toast />
      </body>
    </html>
  );
}
