import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-sans">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500 font-mono">
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
      </body>
    </html>
  );
}
