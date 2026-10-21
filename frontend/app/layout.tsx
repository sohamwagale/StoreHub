import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StoreRank | Discover, Review & Rate Verified Stores',
  description:
    'A transparent store rating platform where verified customers can share ratings, discover top local shops, and store owners gain valuable customer feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<div className="h-16 border-b border-border" />}>
              <Navbar />
            </Suspense>
            <div className="flex-1 flex flex-col">{children}</div>
            <footer className="border-t border-border bg-background py-8 px-4 text-center text-xs text-muted font-mono transition-colors">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© 2026 StoreRank Platform. All rights reserved.</p>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider">
                  <span>Secure JWT</span>
                  <span>•</span>
                  <span>Role-Based RBAC</span>
                  <span>•</span>
                  <span>Verified 1-5★ Engine</span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
