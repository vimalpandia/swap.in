'use client';

import React, { useEffect } from 'react';
import { Logo } from '../components/brand/Logo';
import { RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Swap App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none space-y-6">
      <Logo size="lg" />

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-white">Something slipped off vibe</h2>
        <p className="text-sm text-slate-400">
          An unexpected error occurred while rendering this page. You can try refreshing or jump back to home.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-600/20 hover:opacity-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#11131E] border border-[#24283E] text-slate-200 hover:text-white font-semibold text-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
}

