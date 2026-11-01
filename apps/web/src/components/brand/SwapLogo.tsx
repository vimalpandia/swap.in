import React from 'react';
import Link from 'next/link';

interface SwapLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function SwapLogo({ className = '', size = 'md', showText = true }: SwapLogoProps) {
  const sizeMap = {
    sm: { icon: 26, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 34, text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 46, text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-4xl', gap: 'gap-3.5' },
  };

  const { icon, text, gap } = sizeMap[size];

  return (
    <Link href="/" className={`inline-flex items-center ${gap} select-none group ${className}`}>
      {/* Original Swap Interlocking Dual-Arrow "S" Symbol */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
      >
        <defs>
          <linearGradient id="swapGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="swapGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {/* Upper Arrow Loop curving down to center */}
        <path
          d="M 28 32 C 28 20, 52 16, 70 24 C 84 30, 84 46, 70 54 L 50 64"
          stroke="url(#swapGrad1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upper Arrow Head */}
        <path
          d="M 38 20 L 26 32 L 40 42"
          stroke="url(#swapGrad1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lower Arrow Loop curving up to center forming "S" */}
        <path
          d="M 72 68 C 72 80, 48 84, 30 76 C 16 70, 16 54, 30 46 L 50 36"
          stroke="url(#swapGrad2)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lower Arrow Head */}
        <path
          d="M 62 80 L 74 68 L 60 58"
          stroke="url(#swapGrad2)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span
          className={`font-black tracking-tight ${text} bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent font-sans`}
        >
          SWAP
        </span>
      )}
    </Link>
  );
}

// Default export alias for Logo
export const Logo = SwapLogo;

