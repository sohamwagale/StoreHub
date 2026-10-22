'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Store } from '@/types';
import { api } from '@/lib/api';
import { StoreCardSkeletonGrid } from '@/components/Skeleton';
import {
  Compass,
  Star,
  MapPin,
  Camera,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Store as StoreIcon,
  CheckCircle2,
  ThumbsUp,
  Navigation,
  UserPlus,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [topStores, setTopStores] = useState<Store[]>([]);
  const [totalStoresCount, setTotalStoresCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.stores.getAll();
        setTotalStoresCount(data.length);
        const sorted = [...data]
          .filter((s) => s.averageRating !== null && s.averageRating > 0)
          .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
          .slice(0, 3);
        setTopStores(sorted.length > 0 ? sorted : data.slice(0, 3));
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full bg-background text-foreground">
      {/* 1. Hero Section - Only visible when logged out */}
      {!isAuthenticated ? (
        <section className="border-b border-border bg-background py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Minimal Monochromatic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted-fill text-foreground border border-border text-[11px] font-mono uppercase font-bold tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-accent inline-block" />
              <span>Verified Store Rating Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08] break-words">
              REAL RATINGS.{' '}
              <span className="text-muted dark:text-muted">HONEST REVIEWS.</span>{' '}
              BETTER STORES.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Explore rated local groceries, shopping malls, boutiques, and electronics with genuine customer evaluations, GPS coordinates, and unfiltered community photo logs.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
              >
                <Compass className="w-4 h-4" />
                <span>Continue without sign in</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-foreground bg-surface border border-border hover:bg-muted-fill transition-colors"
              >
                <UserPlus className="w-4 h-4 text-muted" />
                <span>Create Account</span>
              </Link>

              <Link
                href="/register?role=OWNER"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-muted bg-muted-fill border border-border hover:border-foreground transition-colors"
              >
                <StoreIcon className="w-4 h-4 text-muted" />
                <span>Store Owner Sign Up</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono uppercase text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Open Guest Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Verified 1-5 Star Rule</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Community Photo Logs</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Authenticated Clean Bar when user is logged in */
        <section className="py-6 sm:py-8 bg-muted-fill border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-accent inline-block" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
                  Logged in as {user?.role}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Explore local store ratings, discover new favorites, or manage your feedback.
              </p>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link
                href="/stores"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase font-bold text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Stores</span>
              </Link>
              <Link
                href={user?.role === 'OWNER' ? '/owner' : '/dashboard'}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase font-bold bg-surface border border-border text-foreground hover:bg-muted-fill transition-colors"
              >
                <span>{user?.role === 'OWNER' ? 'Owner Portal' : 'My Ratings'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. Top-Rated Stores Showcase */}
      <section className="py-14 sm:py-18 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span>Featured Community Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Top Rated Stores Near You
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Highest scored locations based on genuine customer feedback and ratings
              </p>
            </div>

            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-foreground hover:text-accent transition group"
            >
              <span>Explore all {totalStoresCount > 0 ? `${totalStoresCount} stores` : 'stores'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <StoreCardSkeletonGrid count={3} />
          ) : topStores.length === 0 ? (
            <div className="text-center py-12 bg-muted-fill border border-border">
              <StoreIcon className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-xs font-mono uppercase text-muted">
                Stores will appear here as owners register
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topStores.map((store, idx) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="group relative bg-surface border border-border hover:border-foreground transition-colors flex flex-col justify-between"
                >
                  <div className="relative w-full h-44 bg-black overflow-hidden">
                    {store.photos && store.photos.length > 0 ? (
                      <img
                        src={store.photos[0]}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-muted">
                        <Camera className="w-7 h-7 opacity-40 mb-1" />
                        <span className="text-[11px] font-mono uppercase opacity-60">Verified Store</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-foreground text-background border border-white/20">
                      #{idx + 1} Top Pick
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-mono font-bold bg-black text-rating border border-rating/40 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{store.averageRating !== null ? store.averageRating : 'New'}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted">
                        {store.category || 'General Shop'}
                      </span>
                      <h3 className="text-base font-bold text-foreground group-hover:underline transition-all line-clamp-1 mt-0.5">
                        {store.name}
                      </h3>
                      <p className="text-xs text-muted flex items-start gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
                      <span>{store.totalRatings} Reviews</span>
                      <span className="text-foreground font-bold group-hover:underline flex items-center gap-1">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Platform Capabilities & Core Features */}
      <section className="py-14 sm:py-20 bg-muted-fill border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-muted">
              Why StoreRank
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1">
              Built for Transparent, Reliable Shopping
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Everything customers and business owners need to make informed, trustworthy local shopping decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <Star className="w-5 h-5 text-rating fill-rating" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Verified 1–5 Star Rating
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Single-vote anti-spam rules ensure every customer gets exactly one rating per store with instant updates and transparent scoring.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <Navigation className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Interactive GPS Map Locator
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                MapLibre GL mapping with precise latitude/longitude coordinates, category markers, and instant directions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <Camera className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Authentic Photo Galleries
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Real photographs submitted by shoppers and verified owners with interactive carousel and full-screen lightbox viewing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Helpful Review Voting
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Community voting upvotes helpful feedback and downvotes irrelevant reviews to surface the most valuable guidance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Dedicated Owner Portal
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Store owners access performance metrics, customer review logs, and update their locations and store photo showcases.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-surface border border-border space-y-2.5">
              <div className="w-10 h-10 bg-muted-fill border border-border flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Zero Sponsored Bias
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Rankings and discovery filters are strictly driven by real customer satisfaction and transparent mathematical averages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Call To Action - Only for logged-out visitors */}
      {!isAuthenticated && (
        <section className="py-14 sm:py-20 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Start Exploring Verified Stores Today
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
              Browse without logging in, or sign up to rate your favorite stores and help your community find the best shopping in town.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Stores (No Sign In Required)</span>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-foreground bg-surface border border-border hover:bg-muted-fill transition-colors"
              >
                <span>Join Community</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
