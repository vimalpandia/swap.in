'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function Toast() {
  const { toast, dismissToast } = useUIStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-pink-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/40 text-rose-200',
    info: 'border-pink-500/30 bg-slate-900/90 text-slate-100',
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end"
      aria-live="polite"
    >
      <AnimatePresence>
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl glass shadow-2xl backdrop-blur-xl border text-xs font-medium max-w-sm ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

