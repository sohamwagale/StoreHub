'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Store, User as UserIcon, Mail, Lock, MapPin, AlertCircle, Check, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation rules
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isNameValid = name.trim().length >= 5 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNameValid) {
      setError('Full name must be between 5 and 60 characters long.');
      return;
    }

    if (!isAddressValid) {
      setError('Address must be between 1 and 400 characters long.');
      return;
    }

    if (!hasLength || !hasUppercase || !hasSpecial) {
      setError(
        'Password must be 8-16 characters, contain at least one uppercase letter and one special character.',
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
        role,
      });

      if (user.role === 'OWNER') {
        router.push('/owner');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 mb-4">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join the community to submit store reviews or manage your business
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'USER'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Normal User</div>
                  <div className="text-[11px] text-zinc-500">Rate & review stores</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'OWNER'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Store Owner</div>
                  <div className="text-[11px] text-zinc-500">View customer ratings</div>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Name <span className="text-zinc-400 font-normal">(5–60 characters)</span>
              </label>
              <span
                className={`text-[11px] ${
                  isNameValid
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : name.length > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {name.length}/60
              </span>
            </div>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jonathan Alexander Sterling"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                  name.length > 0 && !isNameValid
                    ? 'border-amber-400 focus:ring-amber-500/40'
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-amber-500/50'
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Address <span className="text-zinc-400 font-normal">(max 400 characters)</span>
              </label>
              <span className="text-[11px] text-zinc-400">{address.length}/400</span>
            </div>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-zinc-400" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Password Validation Badges */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div
                className={`flex items-center gap-1.5 text-[11px] py-1 px-2 rounded-lg border ${
                  hasLength
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasLength ? 'opacity-100' : 'opacity-30'}`} />
                <span>8–16 chars</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[11px] py-1 px-2 rounded-lg border ${
                  hasUppercase
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
                <span>1 Uppercase</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[11px] py-1 px-2 rounded-lg border ${
                  hasSpecial
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasSpecial ? 'opacity-100' : 'opacity-30'}`} />
                <span>1 Special</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
