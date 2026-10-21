'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row">
      {/* LEFT COLUMN: Brand & Value Proposition Showcase (45%) */}
      <div className="relative w-full lg:w-[45%] bg-surface border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        {/* Top Section: Brand Identity */}
        <div>
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-foreground text-background flex items-center justify-center border border-foreground shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground leading-none">
                StoreRank
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted mt-1">
                Discover · Rate · Review
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Hero Copy & Trust Anchor Elements */}
        <div className="py-8 lg:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border text-xs font-mono uppercase tracking-wider text-foreground">
            <span className="w-1.5 h-1.5 bg-accent inline-block shrink-0" />
            <span>Community-Powered Retail Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Transparent ratings from real shoppers in your city.
          </h1>

          <p className="text-sm text-muted leading-relaxed max-w-lg">
            Join thousands of community members discovering the best verified local businesses, sharing objective feedback, and supporting authentic retailers.
          </p>

          {/* Feature Points */}
          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-foreground text-background shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground">
                100% verified in-store visits and genuine rating verification
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-foreground text-background shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Honest ratings protected by strict fraud prevention rules
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
              <div className="flex items-center justify-center w-5 h-5 bg-foreground text-background shrink-0">
                <StorefrontIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Direct community interaction with verified store owners
              </span>
            </div>
          </div>

          {/* Mini Review Highlight Card */}
          <div className="p-4 bg-surface border border-border max-w-lg">
            <div className="flex items-center gap-1 text-rating mb-2">
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
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

        {/* Bottom Branding Footer */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-mono text-muted">
            © 2026 StoreRank Platform. Trusted by over 12,000 local businesses.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Card & Form Canvas (55%) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-surface border border-border p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-muted">
              Enter your credentials to access your StoreRank account
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-2.5 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Authentication failed</span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Demo Quick-Login Pills */}
          <div className="p-3 bg-muted-fill border border-border text-xs font-mono">
            <p className="font-bold uppercase tracking-wider text-foreground mb-2 text-[10px]">
              Quick Fill Demo Accounts:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('alice@example.com')}
                className="px-2.5 py-1 text-[11px] bg-surface text-foreground border border-border hover:border-foreground transition-colors"
              >
                Alice (Customer)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('bob@example.com')}
                className="px-2.5 py-1 text-[11px] bg-surface text-foreground border border-border hover:border-foreground transition-colors"
              >
                Bob (Customer)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('owner@example.com')}
                className="px-2.5 py-1 text-[11px] bg-surface text-foreground border border-border hover:border-foreground transition-colors font-bold"
              >
                Owner (Business)
              </button>
            </div>
          </div>

          {/* Social Login Button */}
          <button
            type="button"
            onClick={() => handleFillDemo('alice@example.com')}
            className="w-full h-10 px-4 border border-border bg-surface hover:bg-muted-fill text-foreground text-xs font-mono uppercase font-bold flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 font-mono text-[11px] uppercase tracking-wider text-muted">
                or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                className="block text-xs font-mono uppercase font-bold text-foreground mb-1"
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.carter@example.com"
                  className="w-full h-10 pl-9 pr-3 bg-surface border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-10 bg-surface border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors tracking-wider"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
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

              <button
                type="button"
                onClick={() => setForgotToast(true)}
                className="text-xs font-mono text-muted hover:text-foreground underline hover:no-underline"
              >
                Forgot password?
              </button>
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
                className="w-full h-10 px-4 bg-foreground text-background hover:bg-accent-hover font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border border-foreground transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
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
                Sign up
              </Link>
            </p>
          </div>
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
