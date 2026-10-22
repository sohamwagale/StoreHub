'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  Store,
  User as UserIcon,
  Mail,
  Lock,
  MapPin,
  AlertCircle,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Store as StorefrontIcon,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Password validation rules
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasLength && hasUppercase && hasSpecial && hasNumber;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

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

    if (!isPasswordValid) {
      setError(
        'Password must be 8-16 characters, contain at least one uppercase letter, one special character, and one number.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the terms of service and community guidelines to register.');
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
    <div className="flex-1 min-h-[calc(100vh-4rem)] w-full grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* LEFT COLUMN: Brand, Onboarding & Trust Canvas (Desktop only) */}
      <section className="hidden lg:flex lg:col-span-5 bg-surface border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 lg:p-12 flex-col justify-between">
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground leading-none">
                StoreRank
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted mt-1">
                Verified Store Rating Platform
              </span>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border text-xs font-mono uppercase tracking-wider text-foreground">
              <span className="w-1.5 h-1.5 bg-accent inline-block shrink-0" />
              <span>Consumer &amp; Community Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Start rating stores and discover top local spots.
            </h1>

            <p className="text-sm text-muted leading-relaxed">
              Create a free account to bookmark favorites, submit detailed customer ratings, upload store photos, and earn verified community badges.
            </p>
          </div>

          {/* Store Owner Callout Banner */}
          <div className="p-4 bg-surface border border-border space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted-fill text-foreground border border-border shrink-0">
                <StorefrontIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Looking to list or manage your retail business?
                </p>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-foreground underline hover:no-underline"
                >
                  <span>Select Store Owner account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Why Join Community Perks */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
              Why Join Our Reviewer Community
            </h2>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 bg-surface border border-border flex items-center justify-center shrink-0">
                  <Star className="w-3.5 h-3.5 text-rating fill-rating" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Share verified ratings</p>
                  <p className="text-xs text-muted">Help thousands of shoppers discover authentic, top-rated neighborhood stores.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 bg-surface border border-border flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Protect your privacy</p>
                  <p className="text-xs text-muted">Verified credentials with privacy-respecting community profiles.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 bg-surface border border-border flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Access store analytics &amp; direct responses</p>
                  <p className="text-xs text-muted">Receive verified merchant replies and dispute resolutions directly.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Stat Highlight Badge */}
        <div className="pt-6 mt-8 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface border border-border text-accent shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground font-mono">12,400+ Verified Stores</div>
              <div className="text-xs text-muted">Registered across 45 cities with real customer validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Clean Registration Card (Desktop: 7 Cols, Mobile: 100%) */}
      <section className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg my-auto">
          <div className="bg-surface border border-border p-5 sm:p-8 space-y-6">
            {/* Mobile Compact Header Branding */}
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-foreground block leading-none">
                    StoreRank
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
                    New Member Registration
                  </span>
                </div>
              </div>
              <Link
                href="/login"
                className="text-xs font-mono uppercase font-bold text-foreground underline"
              >
                Sign In
              </Link>
            </div>

            {/* Card Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="mt-1 text-xs text-muted">
                Join the verified community of trusted shoppers and merchants
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-2.5 text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Registration Error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1.5">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`p-3 border text-left transition-colors flex items-center gap-2.5 ${
                      role === 'USER'
                        ? 'border-foreground bg-foreground text-background font-bold'
                        : 'border-border bg-surface text-muted hover:border-foreground'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-mono uppercase">Shopper</div>
                      <div className={`text-[10px] ${role === 'USER' ? 'opacity-80' : 'text-muted'}`}>Rate &amp; review stores</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`p-3 border text-left transition-colors flex items-center gap-2.5 ${
                      role === 'OWNER'
                        ? 'border-foreground bg-foreground text-background font-bold'
                        : 'border-border bg-surface text-muted hover:border-foreground'
                    }`}
                  >
                    <Store className="w-4 h-4 shrink-0 text-accent" />
                    <div>
                      <div className="text-xs font-mono uppercase">Store Owner</div>
                      <div className={`text-[10px] ${role === 'OWNER' ? 'opacity-80' : 'text-muted'}`}>Manage store listings</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Social Continue Button (Google) */}
              <div className="pt-1">
                <GoogleSignInButton
                  role={role}
                  text="signup_with"
                  onError={(err) => setError(err)}
                />
              </div>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                    or register with email
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase font-bold text-foreground" htmlFor="full_name">
                    Full Name <span className="text-muted font-normal lowercase">(5–60 chars)</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted">{name.length}/60</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Carter"
                    className="w-full h-11 sm:h-10 pl-9 pr-3 bg-surface border border-border text-base sm:text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.carter@example.com"
                    className="w-full h-11 sm:h-10 pl-9 pr-3 bg-surface border border-border text-base sm:text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Address / City */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase font-bold text-foreground" htmlFor="address">
                    Address / City <span className="text-muted font-normal lowercase">(max 400 chars)</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted">{address.length}/400</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Station Road, Kolhapur, Maharashtra"
                    className="w-full h-11 sm:h-10 pl-9 pr-3 bg-surface border border-border text-base sm:text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <p className="text-[11px] font-mono text-muted flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3 text-muted shrink-0" />
                  <span>Used to show relevant local store recommendations</span>
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 sm:h-10 pl-9 pr-12 bg-surface border border-border text-base sm:text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors tracking-wider"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist (Live Validation Component) */}
              <div className="p-3 bg-muted-fill border border-border space-y-1.5 text-xs font-mono">
                <p className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                  Password requirements:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-foreground font-bold' : 'text-muted'}`}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${hasLength ? 'bg-accent border-accent text-background' : 'border-border'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>8–16 characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-foreground font-bold' : 'text-muted'}`}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${hasUppercase ? 'bg-accent border-accent text-background' : 'border-border'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>1 uppercase letter</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-foreground font-bold' : 'text-muted'}`}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${hasSpecial ? 'bg-accent border-accent text-background' : 'border-border'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>1 special character</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-foreground font-bold' : 'text-muted'}`}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${hasNumber ? 'bg-accent border-accent text-background' : 'border-border'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>1 number</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase font-bold text-foreground" htmlFor="confirm_password">
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Passwords match</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 sm:h-10 pl-9 pr-3 bg-surface border border-border text-base sm:text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors tracking-wider"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 border border-border accent-foreground"
                  />
                  <span className="text-xs text-muted leading-snug">
                    I agree to the StoreRank terms of service and community guidelines, and confirm I will provide truthful store ratings.
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 px-4 bg-foreground text-background hover:bg-accent-hover font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border border-foreground transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Card Footer */}
            <div className="pt-4 border-t border-border text-center space-y-2">
              <p className="text-xs text-muted">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-bold text-foreground underline hover:no-underline font-mono uppercase tracking-wider ml-1"
                >
                  Log in
                </Link>
              </p>
              <p className="text-[11px] font-mono text-muted">
                By registering, you agree to our Community Guidelines on fair rating practices.
              </p>
            </div>
          </div>

          {/* External Quick Assist Links */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-muted">
            <span className="hover:text-foreground cursor-pointer">Help Center</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Trust &amp; Safety</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Contact Support</span>
          </div>
        </div>
      </section>
    </div>
  );
}
