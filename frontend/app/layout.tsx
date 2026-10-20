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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-8 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 StoreRank Platform. All rights reserved.</p>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span>Secure JWT Authentication</span>
                <span>•</span>
                <span>Role-Based Access Control</span>
                <span>•</span>
                <span>Verified 1-5 Star Ratings</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
