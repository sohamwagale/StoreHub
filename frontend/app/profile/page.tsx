'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { MyRating } from '@/types';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  Star,
  Loader2,
  ExternalLink,
  Store,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

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
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 text-4xl font-extrabold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {user.name}
              </h1>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  user.role === 'OWNER'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {user.role}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              StoreRank Registered Account Member
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{user.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="pt-8">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Physical Location & Address
            </span>
            <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{user.address}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Used for matching verified local store visits and ratings.
            </p>
          </div>
        </div>

        {/* Stats strip for normal user */}
        {user.role === 'USER' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                Submitted Ratings
              </span>
              <div className="text-2xl font-extrabold text-amber-900 dark:text-white mt-1">
                {ratingsCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                Average Score Given
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {avgScore}★
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                Reviewer Status
              </span>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-2">
                Verified Shopper
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user.role === 'USER' && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Manage My Submitted Ratings</span>
            </Link>
          )}

          {user.role === 'OWNER' && (
            <Link
              href="/owner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Store className="w-4 h-4" />
              <span>Go to Owner Portal</span>
            </Link>
          )}

          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <span>Explore Stores</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
