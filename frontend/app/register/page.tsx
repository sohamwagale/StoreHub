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
        router.push('/owner/onboarding');
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
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white mb-3">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Join the community to submit store reviews or manage your business
          </p>
        </div>

        {error && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`p-3 border text-left transition-colors flex items-center gap-2.5 ${
                  role === 'USER'
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className={`p-1.5 border ${role === 'USER' ? 'border-white/30 dark:border-zinc-900/30' : 'border-zinc-300 dark:border-zinc-700'}`}>
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase">Customer</div>
                  <div className={`text-[10px] ${role === 'USER' ? 'opacity-75' : 'text-zinc-400'}`}>Rate & review stores</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`p-3 border text-left transition-colors flex items-center gap-2.5 ${
                  role === 'OWNER'
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <div className={`p-1.5 border ${role === 'OWNER' ? 'border-white/30 dark:border-zinc-900/30' : 'border-zinc-300 dark:border-zinc-700'}`}>
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase">Store Owner</div>
                  <div className={`text-[10px] ${role === 'OWNER' ? 'opacity-75' : 'text-zinc-400'}`}>Manage store listings</div>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Full Name <span className="text-zinc-400 font-normal lowercase">(5–60 chars)</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-400">
                {name.length}/60
              </span>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jonathan Sterling"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Address <span className="text-zinc-400 font-normal lowercase">(max 400 chars)</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-400">{address.length}/400</span>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>

            {/* Password Validation Badges */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div
                className={`flex items-center gap-1.5 text-[10px] font-mono py-1 px-2 border ${
                  hasLength
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-zinc-400 dark:border-zinc-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasLength ? 'text-amber-500' : 'opacity-30'}`} />
                <span>8–16 chars</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[10px] font-mono py-1 px-2 border ${
                  hasUppercase
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-zinc-400 dark:border-zinc-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasUppercase ? 'text-amber-500' : 'opacity-30'}`} />
                <span>Uppercase</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[10px] font-mono py-1 px-2 border ${
                  hasSpecial
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-zinc-400 dark:border-zinc-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Check className={`w-3 h-3 ${hasSpecial ? 'text-amber-500' : 'opacity-30'}`} />
                <span>Special</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-bold uppercase tracking-wider text-zinc-950 dark:text-white underline hover:no-underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
