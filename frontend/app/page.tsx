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
  Users,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Navigation,
  ExternalLink,
  ShoppingBag,
  Building2,
  Coffee,
  Laptop,
  Shirt,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  const [topStores, setTopStores] = useState<Store[]>([]);
  const [totalStoresCount, setTotalStoresCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.stores.getAll();
        setTotalStoresCount(data.length);
        // Get top 3 rated stores
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
    <div className="flex-1 flex flex-col w-full">
      {/* 1. Hero Section with Glow */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-transparent">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-rose-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Welcome back banner for authenticated users */}
          {isAuthenticated && user && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Welcome back, {user.name}!</span>
              <Link
                href={user.role === 'OWNER' ? '/owner' : '/dashboard'}
                className="underline hover:text-emerald-900 dark:hover:text-emerald-200 ml-1 font-bold"
              >
                Go to {user.role === 'OWNER' ? 'Owner Portal' : 'My Ratings'} →
              </Link>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>The Verified Community Store Rating Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Real Ratings. Honest Reviews.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
              Better Local Shopping.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Discover top-rated local grocery shops, malls, fashion boutiques, and electronics with verified customer feedback, exact GPS coordinates, and real community photos.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            {/* Primary Guest Option: Continue Without Sign In */}
            <Link
              href="/stores"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Continue without sign in</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <span>Create Account</span>
                </Link>

                <Link
                  href="/register?role=OWNER"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
                >
                  <StoreIcon className="w-4 h-4 text-indigo-500" />
                  <span>Register as Store Owner</span>
                </Link>
              </>
            ) : (
              <Link
                href="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
              >
                <span>Browse Store Directory</span>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Free & Open Guest Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Verified 1-to-5 Star Single Rating Rule</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real Customer Photo Showcases</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top-Rated Stores Live Showcase */}
      <section className="py-16 sm:py-20 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200/80 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Featured Community Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Top Rated Stores Near You
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Highest scored locations based on genuine customer feedback and ratings
              </p>
            </div>

            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition group"
            >
              <span>Explore all {totalStoresCount > 0 ? `${totalStoresCount} stores` : 'stores'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : topStores.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <StoreIcon className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Stores will appear here as owners register
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topStores.map((store, idx) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative w-full h-44 bg-zinc-800 overflow-hidden">
                    {store.photos && store.photos.length > 0 ? (
                      <img
                        src={store.photos[0]}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 to-zinc-900 text-zinc-400">
                        <Camera className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[11px] font-medium opacity-60">Verified Store</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      #{idx + 1} Featured
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{store.averageRating !== null ? store.averageRating : 'New'}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {store.category || 'General Shop'}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mt-0.5">
                        {store.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5 mt-1 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span>{store.totalRatings} Reviews</span>
                      <span className="text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                        View Store Page →
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
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Why StoreRank
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-1">
              Built for Transparent, Reliable Shopping
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Everything customers and business owners need to make informed, trustworthy local shopping decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-500/20" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Verified 1–5 Star Rating Engine
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Anti-spam single vote rules ensure every customer gets exactly one rating per store with instant updates and transparent scoring.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Interactive GPS Map Locator
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Integrated MapLibre GL mapping with precise latitude/longitude coordinates, custom category markers, and instant directions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Authentic Photo Galleries
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Real photographs submitted by shoppers and verified owners with interactive carousel and full-screen lightbox viewing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Like & Dislike Review Curation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Community-driven voting upvotes helpful feedback and downvotes irrelevant reviews to surface the most valuable guidance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <StoreIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Dedicated Store Owner Portal
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Store owners access performance metrics, customer review logs, and update their locations and store photo showcases.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Zero Sponsored Bias
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Rankings and discovery filters are strictly driven by real customer satisfaction and transparent mathematical averages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Call To Action */}
      <section className="py-16 bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-rose-500/10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
            Start Exploring Verified Stores Today
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Browse without logging in, or sign up to rate your favorite stores and help your community find the best shopping in town.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/stores"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Stores (No Sign In Required)</span>
            </Link>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <span>Join Community</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
