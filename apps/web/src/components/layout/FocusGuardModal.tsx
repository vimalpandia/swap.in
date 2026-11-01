'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Coffee, BellOff, X } from 'lucide-react';
import { useWasteTimeStore } from '../../store/wasteTimeStore';

export function FocusGuardModal() {
  const router = useRouter();
  const { showFocusGuard, todayMinutes, snoozeFocusGuard } = useWasteTimeStore();
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (!showFocusGuard) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [showFocusGuard]);

  if (!showFocusGuard) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/90 backdrop-blur-xl select-none"
      >
        <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center">
          {/* Close / Dismiss */}
          <button
            onClick={() => snoozeFocusGuard(15)}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Breathing Kinetic Orb */}
          <div className="relative w-48 h-48 flex items-center justify-center my-6">
            <motion.div
              animate={{
                scale: breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.9,
                opacity: breathPhase === 'Inhale' ? 0.8 : 0.4,
              }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/40 via-pink-500/30 to-amber-400/20 blur-xl"
            />
            <motion.div
              animate={{
                scale: breathPhase === 'Inhale' ? 1.2 : breathPhase === 'Hold' ? 1.2 : 0.95,
              }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full border-2 border-pink-400/50 flex flex-col items-center justify-center bg-swap-surface/80 backdrop-blur-md shadow-2xl shadow-pink-500/20"
            >
              <Wind className="w-8 h-8 text-pink-400 mb-1" />
              <span className="text-xs font-mono uppercase tracking-wider text-pink-300 font-bold">
                {breathPhase}
              </span>
            </motion.div>
          </div>

          {/* Friendly Anti-Addiction Nudge Message */}
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold bg-swap-gradient bg-clip-text text-transparent">
              Focus Guard Alert
            </h2>
            <p className="text-sm text-gray-300 max-w-sm">
              You’ve been scrolling for <span className="font-semibold text-amber-400">{todayMinutes} minutes</span> in
              Waste of Time today. Ready to take a mindful break?
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                snoozeFocusGuard(60);
                router.push('/');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-swap-gradient text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-pink-600/20 transition-all"
            >
              <Coffee className="w-4 h-4" />
              <span>Step Away & Rest</span>
            </button>

            <button
              onClick={() => snoozeFocusGuard(15)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-swap-card border border-swap-border text-gray-300 hover:text-white hover:bg-[#1E2235] text-sm font-medium transition-all"
            >
              <BellOff className="w-4 h-4" />
              <span>Snooze (+15 min)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
