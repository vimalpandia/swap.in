'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../components/brand/Logo';
import { Home, Clock, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none space-y-6">
      <Logo size="lg" />

      <div className="space-y-2 max-w-md">
        <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl font-bold text-white">Lost in the scroll?</h2>
        <p className="text-sm text-slate-400">
          The page or vibe you're looking for was moved, deleted, or never existed in the first place.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-600/20 hover:opacity-95 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
        <Link
          href="/reels"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#11131E] border border-[#24283E] text-slate-200 hover:text-white font-semibold text-sm hover:border-slate-500 transition-all"
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Waste Some Time</span>
        </Link>
      </div>
    </div>
  );
}

