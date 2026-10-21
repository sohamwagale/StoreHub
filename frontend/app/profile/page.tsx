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
      <div className="bg-surface p-6 sm:p-8 border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border text-center sm:text-left">
          {/* Avatar */}
          <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center font-mono font-bold text-2xl border border-foreground shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-extrabold text-foreground">
                {user.name}
              </h1>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-muted-fill text-foreground border border-border">
                {user.role}
              </span>
            </div>

            <p className="text-xs font-mono text-muted mt-0.5">
              StoreRank Registered Account Member
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-muted dark:text-muted font-mono">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted" />
                <span>{user.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div>
          <div className="p-4 bg-muted-fill border border-border">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-muted">
              Physical Location & Address
            </span>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{user.address}</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              Used for matching verified local store visits and ratings.
            </p>
          </div>
        </div>

        {/* Stats strip for normal user */}
        {user.role === 'USER' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-muted-fill border border-border">
              <span className="text-[10px] font-mono uppercase font-bold text-muted">
                Submitted Ratings
              </span>
              <div className="text-2xl font-mono font-extrabold text-foreground mt-1">
                {ratingsCount}
              </div>
            </div>

            <div className="p-4 bg-muted-fill border border-border">
              <span className="text-[10px] font-mono uppercase font-bold text-muted">
                Average Score Given
              </span>
              <div className="text-2xl font-mono font-extrabold text-rating mt-1">
                {avgScore}★
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 bg-muted-fill border border-border">
              <span className="text-[10px] font-mono uppercase font-bold text-muted">
                Reviewer Status
              </span>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-foreground mt-2">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <span>My Submitted Ratings</span>
            </Link>
          )}

          {user.role === 'OWNER' && (
            <Link
              href="/owner"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Owner Portal</span>
            </Link>
          )}

          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-semibold bg-surface border border-border text-muted hover:bg-muted-fill transition-colors"
          >
            <span>Explore Stores</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-semibold text-muted hover:text-foreground border border-border hover:bg-muted-fill transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
