'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Store } from '@/types';
import { api } from '@/lib/api';
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
    <div className="flex-1 flex flex-col w-full bg-[#fefce8] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. Hero Section - Only visible when logged out */}
      {!isAuthenticated ? (
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-[#fefce8] dark:bg-zinc-950 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Minimal Monochromatic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[11px] font-mono uppercase font-bold tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-amber-500 inline-block" />
              <span>Verified Store Rating Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-4xl mx-auto leading-[1.08]">
              REAL RATINGS.{' '}
              <span className="text-zinc-400 dark:text-zinc-500">HONEST REVIEWS.</span>{' '}
              BETTER STORES.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Explore rated local groceries, shopping malls, boutiques, and electronics with genuine customer evaluations, GPS coordinates, and unfiltered community photo logs.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
              >
                <Compass className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Continue without sign in</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-zinc-500" />
                <span>Create Account</span>
              </Link>

              <Link
                href="/register?role=OWNER"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white transition-colors"
              >
                <StoreIcon className="w-4 h-4 text-zinc-500" />
                <span>Store Owner Sign Up</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Open Guest Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Verified 1-5 Star Rule</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Community Photo Logs</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Authenticated Clean Bar when user is logged in */
        <section className="py-6 sm:py-8 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-amber-500 inline-block" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Logged in as {user?.role}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Explore local store ratings, discover new favorites, or manage your feedback.
              </p>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link
                href="/stores"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>Explore Stores</span>
              </Link>
              <Link
                href={user?.role === 'OWNER' ? '/owner' : '/dashboard'}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>{user?.role === 'OWNER' ? 'Owner Portal' : 'My Ratings'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. Top-Rated Stores Showcase */}
      <section className="py-14 sm:py-18 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured Community Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Top Rated Stores Near You
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Highest scored locations based on genuine customer feedback and ratings
              </p>
            </div>

            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-zinc-900 hover:text-black dark:text-zinc-300 dark:hover:text-white transition group"
            >
              <span>Explore all {totalStoresCount > 0 ? `${totalStoresCount} stores` : 'stores'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : topStores.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <StoreIcon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400">
                Stores will appear here as owners register
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topStores.map((store, idx) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors flex flex-col justify-between"
                >
                  <div className="relative w-full h-44 bg-zinc-900 overflow-hidden">
                    {store.photos && store.photos.length > 0 ? (
                      <img
                        src={store.photos[0]}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                        <Camera className="w-7 h-7 opacity-40 mb-1" />
                        <span className="text-[11px] font-mono uppercase opacity-60">Verified Store</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-950 text-white border border-white/20">
                      #{idx + 1} Top Pick
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-mono font-bold bg-zinc-950 text-amber-400 border border-amber-400/40 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{store.averageRating !== null ? store.averageRating : 'New'}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-500">
                        {store.category || 'General Shop'}
                      </span>
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white group-hover:underline transition-all line-clamp-1 mt-0.5">
                        {store.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      <span>{store.totalRatings} Reviews</span>
                      <span className="text-zinc-950 dark:text-white font-bold group-hover:underline flex items-center gap-1">
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
      <section className="py-14 sm:py-20 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-zinc-500">
              Why StoreRank
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-1">
              Built for Transparent, Reliable Shopping
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Everything customers and business owners need to make informed, trustworthy local shopping decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Verified 1–5 Star Rating
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Single-vote anti-spam rules ensure every customer gets exactly one rating per store with instant updates and transparent scoring.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Interactive GPS Map Locator
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                MapLibre GL mapping with precise latitude/longitude coordinates, category markers, and instant directions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <Camera className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Authentic Photo Galleries
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real photographs submitted by shoppers and verified owners with interactive carousel and full-screen lightbox viewing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Helpful Review Voting
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Community voting upvotes helpful feedback and downvotes irrelevant reviews to surface the most valuable guidance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Dedicated Owner Portal
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Store owners access performance metrics, customer review logs, and update their locations and store photo showcases.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Zero Sponsored Bias
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Rankings and discovery filters are strictly driven by real customer satisfaction and transparent mathematical averages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Call To Action - Only for logged-out visitors */}
      {!isAuthenticated && (
        <section className="py-14 sm:py-20 bg-white dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              Start Exploring Verified Stores Today
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Browse without logging in, or sign up to rate your favorite stores and help your community find the best shopping in town.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
              >
                <Compass className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Explore Stores (No Sign In Required)</span>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
