'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { UserRole } from '@/types';
import { Loader2, AlertCircle, X, ExternalLink, HelpCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  role?: UserRole;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  role = 'USER',
  text = 'continue_with',
  onSuccess,
  onError,
  className = '',
}: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(
    clientId && clientId.trim() !== '' && !clientId.includes('your_google_client_id_here'),
  );

  // Check if GSI is already present in window
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setScriptLoaded(true);
    }
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response?.credential) return;

      setIsLoading(true);
      try {
        const user = await googleLogin(response.credential, role);
        if (onSuccess) {
          onSuccess(user);
        } else {
          if (user.role === 'OWNER') {
            router.push('/owner');
          } else {
            router.push('/dashboard');
          }
        }
      } catch (err: any) {
        const msg = err?.message || 'Google Sign-In failed. Please try again.';
        if (onError) onError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [googleLogin, role, onSuccess, onError, router],
  );

  const renderGoogleButton = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id || !isConfigured || !clientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        const measuredWidth = buttonContainerRef.current.offsetWidth || 340;
        const targetWidth = Math.min(Math.max(measuredWidth, 240), 400);

        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: targetWidth,
        });
      }

      // Automatically present Google One-Tap for return users if on login page
      if (text === 'continue_with' || text === 'signin_with') {
        window.google.accounts.id.prompt();
      }
    } catch (err) {
      console.warn('Failed to render Google Sign-In button:', err);
    }
  }, [clientId, handleCredentialResponse, isConfigured, text, theme]);

  useEffect(() => {
    if (scriptLoaded && isConfigured) {
      renderGoogleButton();
    }
  }, [scriptLoaded, isConfigured, role, text, theme, renderGoogleButton]);

  const handleCustomButtonClick = () => {
    if (!isConfigured) {
      setShowSetupModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          const btn = buttonContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (btn) btn.click();
        }
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Load Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.warn('Could not load Google Identity Services')}
      />

      {/* If Configured: Render Google's Official Button */}
      {isConfigured ? (
        <div className="relative w-full flex flex-col items-center justify-center">
          <div
            ref={buttonContainerRef}
            className="w-full flex justify-center min-h-[44px] items-center"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2 border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-xs font-mono font-bold">Verifying with Google...</span>
            </div>
          )}
        </div>
      ) : (
        /* If Not Configured Yet: Fallback Button with Informative Setup Prompt */
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={isLoading}
          className="w-full h-11 sm:h-10 px-4 border border-border bg-surface hover:bg-muted-fill text-foreground text-xs font-mono uppercase font-bold flex items-center justify-center gap-2.5 transition-colors active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Verifying Google account...</span>
            </>
          ) : (
            <>
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
              <span className="text-[9px] font-normal px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded">
                Setup
              </span>
            </>
          )}
        </button>
      )}

      {/* Google Setup Guide Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-lg p-6 shadow-2xl relative text-left">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-[4px] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-foreground">
                    Google OAuth Setup Required
                  </h3>
                  <p className="text-[11px] font-mono text-muted">
                    Frontend & Backend are ready for Google Sign-In
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="text-muted hover:text-foreground p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-muted leading-relaxed">
              <p>
                To enable 1-click Google Sign-In, you just need a <strong>Google Client ID</strong> from Google Cloud Console:
              </p>

              <ol className="list-decimal list-inside space-y-2 font-mono text-[11px] bg-background p-3.5 border border-border">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline inline-flex items-center gap-0.5 font-bold"
                  >
                    Google Cloud Credentials <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <strong>Web application</strong>).</li>
                <li>Add Authorized JavaScript origin: <code className="text-foreground font-bold">http://localhost:3000</code></li>
                <li>Copy the Client ID and add it to your environment files:</li>
              </ol>

              <div className="bg-background border border-border p-3 font-mono text-[11px] space-y-1 text-foreground">
                <div className="text-muted text-[10px]"># frontend/.env.local</div>
                <div className="text-amber-500">NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com</div>
                <div className="text-muted text-[10px] mt-2"># backend/.env</div>
                <div className="text-amber-500">GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com</div>
              </div>

              <p className="text-[11px]">
                Detailed step-by-step instructions have also been printed in your chat assistant!
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase font-bold hover:bg-accent-hover transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
