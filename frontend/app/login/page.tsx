'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  Store,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  Shield,
  Store as StorefrontIcon,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotToast, setForgotToast] = useState(false);
  const [activeAccountType, setActiveAccountType] = useState<'USER' | 'OWNER'>('USER');
  const [mobilePerksOpen, setMobilePerksOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await login(email.trim(), password);
      if (user.role === 'OWNER') {
        router.push('/owner');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, role: 'USER' | 'OWNER') => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setActiveAccountType(role);
    setError(null);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row bg-background">
      {/* DESKTOP ONLY (lg+) BRAND & TRUST SIDEBAR (45%) */}
      <div className="hidden lg:flex lg:w-[45%] bg-surface border-r border-border flex-col justify-between p-8 xl:p-12">
        {/* Brand Identity */}
        <div>
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-foreground leading-none">
                StoreRank
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted mt-1">
                Discover · Rate · Review
              </span>
            </div>
          </div>
        </div>

        {/* Hero Pitch & Trust Proof */}
        <div className="py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border text-xs font-mono uppercase tracking-wider text-foreground">
            <span className="w-1.5 h-1.5 bg-accent inline-block shrink-0" />
            <span>Community-Powered Retail Intelligence</span>
          </div>

          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Transparent ratings from real shoppers in your city.
          </h1>

          <p className="text-sm text-muted leading-relaxed max-w-lg">
            Join thousands of community members discovering the best verified local businesses, sharing objective feedback, and supporting authentic retailers.
          </p>

          {/* Feature Points */}
          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] shrink-0">
                <Check className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                100% verified in-store visits and genuine rating verification
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] shrink-0">
                <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Honest ratings protected by strict fraud prevention rules
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-amber-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-[4px] shrink-0">
                <StorefrontIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Direct community interaction with verified store owners
              </span>
            </div>
          </div>

          {/* Mini Review Testimonial */}
          <div className="p-4 bg-surface border border-border max-w-lg">
            <div className="flex items-center gap-1 text-rating mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-rating text-rating" />
              ))}
              <span className="ml-2 text-[10px] font-mono uppercase text-muted font-bold">
                Verified Member
              </span>
            </div>
            <p className="text-xs italic text-foreground leading-relaxed">
              "StoreRank helped our neighborhood discover authentic repair shops, boutique grocers, and certified tech stores with zero fake reviews."
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted border-t border-border pt-2 font-mono">
              <span className="font-semibold text-foreground">— Anita Desai, Kolhapur</span>
              <span className="inline-flex items-center gap-1 text-accent text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Verified Reviewer
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-mono text-muted">
            © 2026 StoreRank Platform. Trusted by over 12,000 local businesses.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN (DESKTOP: 55%, MOBILE: 100% FULL-WIDTH) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center px-4 py-6 sm:px-8 sm:py-10 lg:p-12">
        <div className="w-full max-w-md bg-surface border border-border p-5 sm:p-8 space-y-5">
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
                  Sign In Portal
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-muted-fill border border-border px-2 py-0.5 text-muted font-bold">
              Secure 256-bit
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Enter your credentials to access your StoreRank account
            </p>
          </div>

          {/* Account Role Selector Tab (Mobile Friendly) */}
          <div className="grid grid-cols-2 p-1 bg-muted-fill border border-border text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setActiveAccountType('USER');
                handleFillDemo('alice@example.com', 'USER');
              }}
              className={`py-2 px-3 text-center transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                activeAccountType === 'USER'
                  ? 'bg-foreground text-background border border-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span>👤 Shopper</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveAccountType('OWNER');
                handleFillDemo('owner@example.com', 'OWNER');
              }}
              className={`py-2 px-3 text-center transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                activeAccountType === 'OWNER'
                  ? 'bg-foreground text-background border border-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span>🏪 Store Owner</span>
            </button>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-2.5 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold block">Authentication failed</span>
                <span className="break-words">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Demo Quick-Fill Accounts (Touch-Optimized Row) */}
          <div className="p-3 bg-muted-fill border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>One-Tap Demo Credentials</span>
              </span>
              <span className="text-[9px] font-mono text-muted">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('alice@example.com', 'USER')}
                className={`p-2 text-left border transition-all text-xs font-mono ${
                  email === 'alice@example.com'
                    ? 'border-foreground bg-surface text-foreground font-bold shadow-sm'
                    : 'border-border bg-surface/70 text-muted hover:border-foreground hover:text-foreground'
                }`}
              >
                <div className="text-[10px] font-bold text-foreground truncate">Alice</div>
                <div className="text-[9px] text-muted truncate">Customer</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('bob@example.com', 'USER')}
                className={`p-2 text-left border transition-all text-xs font-mono ${
                  email === 'bob@example.com'
                    ? 'border-foreground bg-surface text-foreground font-bold shadow-sm'
                    : 'border-border bg-surface/70 text-muted hover:border-foreground hover:text-foreground'
                }`}
              >
                <div className="text-[10px] font-bold text-foreground truncate">Bob</div>
                <div className="text-[9px] text-muted truncate">Reviewer</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('owner@example.com', 'OWNER')}
                className={`p-2 text-left border transition-all text-xs font-mono ${
                  email === 'owner@example.com'
                    ? 'border-amber-500 bg-surface text-foreground font-bold shadow-sm'
                    : 'border-border bg-surface/70 text-muted hover:border-foreground hover:text-foreground'
                }`}
              >
                <div className="text-[10px] font-bold text-foreground truncate text-amber-600 dark:text-amber-400">David</div>
                <div className="text-[9px] text-muted truncate">Owner</div>
              </button>
            </div>
          </div>

          {/* Social Continue Button (Google) */}
          <GoogleSignInButton
            role={activeAccountType}
            text="continue_with"
            onError={(err) => setError(err)}
          />

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field - text-base on mobile prevents iOS auto-zoom, sm:text-xs on desktop */}
            <div>
              <label
                className="block text-xs font-mono uppercase font-bold text-foreground mb-1.5"
                htmlFor="email"
              >
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-mono uppercase font-bold text-foreground"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted hover:text-foreground focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border border-border accent-foreground"
                />
                <span className="text-xs text-muted font-mono">
                  Remember device
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-mono text-muted hover:text-foreground underline hover:no-underline py-1"
              >
                Forgot password?
              </Link>
            </div>

            {forgotToast && (
              <div className="p-2.5 bg-muted-fill border border-accent text-[11px] font-mono text-foreground flex items-center justify-between">
                <span>Demo mode: Reset link will be simulated or use Quick-Fill above.</span>
                <button type="button" onClick={() => setForgotToast(false)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Primary Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-10 px-4 bg-foreground text-background hover:bg-accent-hover font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border border-foreground transition-colors disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to Account</span>
                    <ArrowRight className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer / Registration prompt */}
          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-foreground underline hover:no-underline font-mono uppercase tracking-wider ml-1"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Why StoreRank Accordion (Non-intrusive value propositions on mobile) */}
        <div className="w-full max-w-md mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePerksOpen(!mobilePerksOpen)}
            className="w-full py-2.5 px-3 bg-surface border border-border text-xs font-mono uppercase font-bold text-muted hover:text-foreground flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Why choose StoreRank?</span>
            </div>
            {mobilePerksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {mobilePerksOpen && (
            <div className="p-4 bg-surface border-x border-b border-border space-y-2.5 text-xs text-muted">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>100% verified in-store visits and genuine shopper ratings.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>Fraud protection prevents sponsored or manipulated ratings.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>Direct community interaction with verified store owners.</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Trust Footer */}
        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-xs font-mono text-muted">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Protected by StoreRank Shield &amp; 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
