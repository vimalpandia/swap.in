'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../../components/brand/Logo';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { login, password });
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
      setError(errorMsg || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (username: string) => {
    setLogin(username);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08090E] select-none">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-[#11131E] border border-[#24283E] shadow-2xl space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Logo size="lg" />
          <p className="text-xs text-slate-400">Swap moments. Swap vibes.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Username or Email</label>
            <input
              type="text"
              required
              placeholder="alex_swap"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#161928] border border-[#24283E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Swap'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-2 border-t border-[#24283E] space-y-2">
          <span className="text-[11px] text-gray-500 block text-center">Quick Demo Accounts:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('alex_swap')}
              className="p-2 rounded-xl bg-[#161928] border border-[#24283E] text-gray-300 hover:text-white hover:border-pink-400"
            >
              @alex_swap
            </button>
            <button
              onClick={() => handleDemoLogin('maya_vibes')}
              className="p-2 rounded-xl bg-[#161928] border border-[#24283E] text-gray-300 hover:text-white hover:border-pink-400"
            >
              @maya_vibes
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pt-2">
          Don’t have an account?{' '}
          <Link href="/auth/signup" className="text-pink-400 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
