'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../../components/brand/Logo';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/signup', {
        email,
        username,
        name,
        password,
      });

      if (res.data.success) {
        setUser(res.data.data.user, res.data.data.tokens.accessToken);
        router.push('/');
      }
    } catch (err: any) {
      const errorObj = err.response?.data?.error;
      let errorMsg = errorObj?.message;
      if (errorObj?.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
        errorMsg = errorObj.details.map((d: any) => d.message || `${d.field}: invalid`).join(', ');
      }
      if (!errorMsg && err.response?.status) {
        if (err.response.status === 404) {
          errorMsg = 'API endpoint not reachable (404). Please check deployment routing.';
        } else if (err.response.status === 503) {
          errorMsg = 'Database connection unavailable (503). Verify MongoDB Atlas configuration.';
        } else {
          errorMsg = `Server error (${err.response.status}): ${err.response.statusText || 'Request failed'}`;
        }
      }
      if (!errorMsg && err.message) {
        if (err.message.includes('Network Error')) {
          errorMsg = 'Network error: Cannot reach SWAP API server. Verify backend status and CORS.';
        } else {
          errorMsg = err.message;
        }
      }
      setError(errorMsg || 'Failed to create account. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08090E] select-none">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-[#11131E] border border-[#24283E] shadow-2xl space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Logo size="lg" />
          <p className="text-xs text-slate-400">Join the Swap collective.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Username</label>
            <input
              type="text"
              required
              placeholder="vibe_creator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Display Name</label>
            <input
              type="text"
              required
              placeholder="Kai Tanaka"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="At least 8 chars with 1 uppercase & number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Create Swap Account'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-pink-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
