'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setPreviewUrl(null);

    try {
      const res = await api.auth.forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.simulated && res.previewUrl) {
        setPreviewUrl(res.previewUrl);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-surface border border-border p-6 sm:p-8 space-y-6">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted-fill text-muted border border-border text-[10px] font-mono uppercase tracking-wider mb-2">
            <Key className="w-3 h-3 text-accent" />
            <span>Account Security</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-mono">
            Reset Password
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Enter your registered email address and we'll send you a secure link to reset your account password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {successMessage} Please check your email inbox and spam folder.
              </p>
            </div>

            {previewUrl && (
              <div className="p-3 bg-muted-fill border border-accent text-xs font-mono space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                  Local Simulation Active (Resend API key not set)
                </span>
                <p className="text-[11px] text-muted">
                  Click the direct link below to simulate opening the reset email:
                </p>
                <Link
                  href={previewUrl.replace('http://localhost:3000', '')}
                  className="inline-block text-xs font-bold text-foreground underline hover:no-underline break-all"
                >
                  {previewUrl} &rarr;
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full h-10 px-4 bg-foreground text-background text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 border border-foreground hover:bg-accent-hover transition-colors"
              >
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.carter@example.com"
                  className="w-full h-10 pl-9 pr-3 bg-muted-fill border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-10 px-4 bg-foreground text-background hover:bg-accent-hover font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border border-foreground transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
