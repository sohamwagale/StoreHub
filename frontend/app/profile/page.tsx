'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Mail,
  MapPin,
  Star,
  Loader2,
  ExternalLink,
  Store,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { ProfileSkeleton } from '@/components/Skeleton';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();

  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<string>('N/A');
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    try {
      if (user?.role === 'USER') {
        const data = await api.ratings.getMyRatings();
        setRatingsCount(data.length);
        if (data.length > 0) {
          const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
          setAvgScore(avg.toFixed(1));
        }
      }
    } catch {
      // ignore stat fetch error
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchStats();
      }
    }
  }, [user, isAuthLoading, router, fetchStats]);

  if (isAuthLoading || (!user && isLoadingStats)) {
    return <ProfileSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-16 h-16 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-mono font-bold text-2xl border border-zinc-950 dark:border-white shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
                {user.name}
              </h1>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                {user.role}
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
              StoreRank Registered Account Member
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400">
              Physical Location & Address
            </span>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{user.address}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Used for matching verified local store visits and ratings.
            </p>
          </div>
        </div>

        {/* Stats strip for normal user */}
        {user.role === 'USER' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                Submitted Ratings
              </span>
              <div className="text-2xl font-mono font-extrabold text-zinc-950 dark:text-white mt-1">
                {ratingsCount}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                Average Score Given
              </span>
              <div className="text-2xl font-mono font-extrabold text-amber-500 mt-1">
                {avgScore}★
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                Reviewer Status
              </span>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white mt-2">
                Verified Shopper
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {user.role === 'USER' && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>My Submitted Ratings</span>
            </Link>
          )}

          {user.role === 'OWNER' && (
            <Link
              href="/owner"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Owner Portal</span>
            </Link>
          )}

          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>Explore Stores</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
