'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Key, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new link.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet complexity requirements.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.auth.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono">
          Invalid or missing reset token. Please request a new link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block px-4 py-2 bg-foreground text-background text-xs font-mono uppercase font-bold border border-foreground"
        >
          Request Reset Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold uppercase font-mono text-foreground">
          Password Reset Complete
        </h2>
        <p className="text-xs text-muted">
          Your password has been securely updated. You can now log in with your new credentials.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full h-10 px-4 bg-foreground text-background text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 border border-foreground hover:bg-accent-hover transition-colors"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
          New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-10 pl-9 pr-3 bg-muted-fill border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors font-mono tracking-wider"
          />
        </div>

        {/* Validation Checklist */}
        {newPassword && (
          <div className="mt-2 space-y-1 text-[11px] font-mono">
            <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
              <span>{hasLength ? '✓' : '•'} 8 to 16 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
              <span>{hasUpper ? '✓' : '•'} At least 1 uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
              <span>{hasNumber ? '✓' : '•'} At least 1 number</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
              <span>{hasSpecial ? '✓' : '•'} At least 1 special character</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-10 pl-9 pr-3 bg-muted-fill border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors font-mono tracking-wider"
          />
        </div>
        {confirmPassword && !passwordsMatch && (
          <span className="text-[10px] font-mono text-red-500 mt-1 block">
            Passwords do not match.
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isPasswordValid || !passwordsMatch}
        className="w-full h-10 px-4 bg-foreground text-background hover:bg-accent-hover font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border border-foreground transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <span>Save New Password</span>
            <ArrowRight className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-surface border border-border p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted-fill text-muted border border-border text-[10px] font-mono uppercase tracking-wider mb-2">
            <Key className="w-3 h-3 text-accent" />
            <span>Security Verification</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-mono">
            Set New Password
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Choose a strong, unique password to secure your StoreRank account.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
