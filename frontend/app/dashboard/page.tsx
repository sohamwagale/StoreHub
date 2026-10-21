'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MyRating, Store, DashboardStats } from '@/types';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import RatingModal from '@/components/RatingModal';
import {
  User as UserIcon,
  MapPin,
  Star,
  Edit2,
  Calendar,
  Store as StoreIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
  Plus,
  ThumbsUp,
  Bookmark,
  Award,
  ChevronRight,
  Share2,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function UserDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [myRatings, setMyRatings] = useState<MyRating[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [bookmarkedStores, setBookmarkedStores] = useState<Store[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'verified' | 'photos'>('all');

  // Edit Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);

  const triggerToast = (title: string, body: string) => {
    setToastMessage({ title, body });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ratingsData, storesData, bookmarksData, statsData] = await Promise.all([
        api.ratings.getMyRatings(),
        api.stores.getAll().catch(() => []),
        api.users.getBookmarks().catch(() => []),
        api.users.getDashboardStats().catch(() => null),
      ]);
      setMyRatings(ratingsData);
      setAllStores(storesData);
      setBookmarkedStores(bookmarksData);
      setDashboardStats(statsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your submitted ratings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadDashboardData();
      }
    }
  }, [user, isAuthLoading, router, loadDashboardData]);

  const displayedBookmarks = useMemo(() => {
    if (bookmarkedStores.length > 0) {
      return bookmarkedStores;
    }
    // Fallback to top stores
    return allStores.slice(0, 3);
  }, [allStores, bookmarkedStores]);

  // Total helpful votes calculation (from live backend data)
  const totalHelpfulVotes = useMemo(() => {
    if (dashboardStats) return dashboardStats.totalHelpfulVotes;
    return myRatings.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  }, [myRatings, dashboardStats]);

  // Filtered ratings
  const filteredRatings = useMemo(() => {
    return myRatings.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.store?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.review?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.store?.category?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === 'photos') {
        return (item.photos && item.photos.length > 0);
      }
      return true;
    });
  }, [myRatings, searchQuery, filterTab]);

  if (isAuthLoading || (!user && !error)) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-zinc-400 font-mono text-xs">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleOpenEdit = (ratingItem: MyRating) => {
    if (!ratingItem.store) return;
    const storeObj: Store = {
      id: ratingItem.store.id,
      _id: ratingItem.store.id,
      name: ratingItem.store.name,
      address: ratingItem.store.address,
      ownerId: '',
      averageRating: null,
      totalRatings: 0,
      userRating: ratingItem.rating,
      userReview: ratingItem.review,
      userPhotos: ratingItem.photos,
    };
    setSelectedStore(storeObj);
    setIsModalOpen(true);
  };

  const handleShareStore = (storeId?: string) => {
    if (typeof window !== 'undefined' && storeId) {
      const url = `${window.location.origin}/stores/${storeId}`;
      navigator.clipboard.writeText(url);
      triggerToast('Link Copied', 'Store link copied to clipboard.');
    }
  };

  // Reviewer Level calculation
  const reviewCount = dashboardStats ? dashboardStats.totalRatings : myRatings.length;
  const currentRank = dashboardStats?.reviewerRank || (reviewCount >= 10 ? 'Level 4 Master Reviewer' : reviewCount >= 5 ? 'Level 3 Connoisseur' : reviewCount >= 2 ? 'Level 2 Contributor' : 'Level 1 Explorer');
  const targetReviews = reviewCount < 3 ? 3 : reviewCount < 6 ? 6 : reviewCount < 10 ? 10 : 25;
  const nextRank = reviewCount < 3 ? 'Level 2 Contributor' : reviewCount < 6 ? 'Level 3 Connoisseur' : reviewCount < 10 ? 'Level 4 Master Reviewer' : 'Hall of Fame Critic';
  const progressPercent = Math.min(100, Math.round((reviewCount / targetReviews) * 100));

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* ================= TOP HEADER (Stitch Structure) ================= */}
      <header className="sticky top-0 z-20 bg-[#fffde7]/95 dark:bg-zinc-950/95 border-b border-zinc-300 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400">
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-zinc-950 dark:text-white font-bold">Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Welcome back, {user.name}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Here is your reviewer activity and store recommendations across the community.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your ratings..."
                className="w-full h-9 pl-9 pr-3 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>

            {/* Write Review CTA */}
            <Link
              href="/stores"
              className="h-9 px-4 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono uppercase font-bold flex items-center gap-1.5 border border-zinc-950 dark:border-white hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Write a Review</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= CONTENT BODY ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= 1. QUICK METRICS CARDS (4 COLUMNS) ================= */}
        <section aria-label="Reviewer Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Ratings Given */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Total Ratings Given</span>
              <div className="w-8 h-8 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-white">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-zinc-950 dark:text-white font-mono leading-none">
                {myRatings.length}
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                +1 this month
              </span>
            </div>
          </div>

          {/* Card 2: Helpful Votes Received */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Helpful Votes Received</span>
              <div className="w-8 h-8 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-white">
                <ThumbsUp className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-zinc-950 dark:text-white font-mono leading-none">
                {totalHelpfulVotes}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +8 this week
              </span>
            </div>
          </div>

          {/* Card 3: Bookmarked Stores */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Bookmarked Stores</span>
              <div className="w-8 h-8 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-white">
                <Bookmark className="w-4 h-4 text-amber-400 fill-current" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-zinc-950 dark:text-white font-mono leading-none">
                {dashboardStats ? dashboardStats.bookmarkedCount : bookmarkedStores.length}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Saved &amp; active
              </span>
            </div>
          </div>

          {/* Card 4: Reviewer Rank */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Reviewer Rank</span>
              <div className="w-8 h-8 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-white">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-extrabold text-zinc-950 dark:text-white font-mono leading-none truncate max-w-[170px]" title={currentRank}>
                {currentRank}
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-mono font-bold uppercase shrink-0">
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* ================= 2. TWO-COLUMN LAYOUT (8 cols / 4 cols) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT COLUMN (8 COLS) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Ratings & Reviews List Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800">
              {/* Header & Filter Tabs */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                    Recent Ratings &amp; Reviews
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Manage your published opinions and feedback
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex border border-zinc-300 dark:border-zinc-700 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`px-3 py-1 font-bold uppercase transition-colors ${
                        filterTab === 'all'
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('verified')}
                      className={`px-3 py-1 font-bold uppercase border-l border-zinc-300 dark:border-zinc-700 transition-colors ${
                        filterTab === 'verified'
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      Verified Visits
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('photos')}
                      className={`px-3 py-1 font-bold uppercase border-l border-zinc-300 dark:border-zinc-700 transition-colors ${
                        filterTab === 'photos'
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      With Photos
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Items List */}
              {isLoading ? (
                <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                  <span>Loading submitted ratings...</span>
                </div>
              ) : filteredRatings.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                    No submitted ratings found
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    You haven't submitted any reviews matching this filter. Explore local stores and share your feedback!
                  </p>
                  <Link
                    href="/stores"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono uppercase font-bold border border-zinc-950 dark:border-white transition-colors"
                  >
                    <span>Discover Stores to Rate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRatings.map((item) => {
                    const initials = item.store?.name
                      ? item.store.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'ST';

                    return (
                      <article key={item.id} className="p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-zinc-950 dark:border-white">
                              {initials}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/stores/${item.store?.id}`}
                                  className="text-sm font-bold text-zinc-950 dark:text-white hover:underline font-mono"
                                >
                                  {item.store?.name || 'Store'}
                                </Link>
                                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono uppercase">
                                  {item.store?.category || 'Retail'}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">
                                {item.store?.address}
                              </span>
                            </div>
                          </div>

                          {/* Stars & Date */}
                          <div className="flex flex-col sm:items-end">
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={item.rating} size="sm" />
                              <span className="font-bold text-xs font-mono text-zinc-950 dark:text-white">
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500 mt-0.5">
                              Reviewed {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Review Snippet */}
                        <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                          "{item.review || 'Customer rating submitted with no written commentary.'}"
                        </p>

                        {/* Photos if any */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.photos.map((pUrl, pIdx) => (
                              <img
                                key={pIdx}
                                src={pUrl}
                                alt="Your review photo"
                                className="w-14 h-14 object-cover border border-zinc-300 dark:border-zinc-700"
                              />
                            ))}
                          </div>
                        )}

                        {/* Footer & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                            <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                            <span>18 helpful votes</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="px-3 py-1 text-xs font-mono uppercase font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white transition-colors"
                            >
                              Edit Review
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareStore(item.store?.id)}
                              className="px-3 py-1 text-xs font-mono uppercase font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white transition-colors"
                            >
                              Share
                            </button>
                            <Link
                              href={`/stores/${item.store?.id}`}
                              className="px-3 py-1 text-xs font-mono uppercase font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                            >
                              View Store
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (4 COLS - SIDEBAR WIDGETS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: Quick Access Favorites / Bookmarks */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                  Quick Access Favorites
                </h2>
                <Link href="/stores" className="text-xs font-mono uppercase font-bold text-zinc-950 dark:text-white underline hover:no-underline">
                  Manage ({bookmarkedStores.length})
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayedBookmarks.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700">
                    No stores bookmarked yet. Explore stores to save your favorites!
                  </div>
                ) : (
                  displayedBookmarks.map((s) => (
                    <Link
                      key={s.id}
                      href={`/stores/${s.id}`}
                      className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-950 dark:hover:border-white transition-colors flex flex-col gap-1.5 block group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold uppercase text-zinc-950 dark:text-white truncate group-hover:underline">
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-950 dark:text-white shrink-0">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{s.averageRating !== null && s.averageRating !== undefined ? s.averageRating.toFixed(1) : '4.8'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
                          Open now
                        </span>
                        <span className="text-[10px] uppercase text-zinc-400 truncate max-w-[120px]">
                          {s.category || 'Retail'}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Widget 2: Reviewer Badge / Reputation Progress */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    Reputation Status
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white font-mono mt-0.5">
                    {currentRank}
                  </h3>
                </div>
                <div className="w-9 h-9 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-white shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                    {progressPercent}% to {nextRank}
                  </span>
                  <span className="text-zinc-500">
                    {reviewCount} / {targetReviews} reviews
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-zinc-950 dark:bg-white transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Next Unlock */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-xs font-mono">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong>Next unlock:</strong> Verified Community Badge &amp; Early Access to Store Promotions
                </p>
              </div>
            </div>

            {/* Widget 3: Switch to Store Owner View Banner */}
            <div className="bg-zinc-950 text-white dark:bg-zinc-900 dark:text-white border border-zinc-950 dark:border-zinc-700 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <StoreIcon className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Business Portal
                </span>
              </div>
              <h4 className="text-sm font-bold font-mono tracking-tight text-white">
                Own a store in the community?
              </h4>
              <p className="text-xs text-zinc-300 dark:text-zinc-400 leading-relaxed">
                Claim your business profile to view customer sentiment, track rating scores, and respond officially to customer reviews.
              </p>
              <Link
                href={user.role === 'OWNER' ? '/owner' : '/register'}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 pt-1 underline hover:no-underline"
              >
                <span>{user.role === 'OWNER' ? 'Open Store Owner Portal' : 'Register Store Owner Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Rating Modal */}
      {selectedStore && (
        <RatingModal
          isOpen={isModalOpen}
          store={selectedStore}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStore(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedStore(null);
            triggerToast('Rating Updated', 'Your review and score were successfully updated.');
            loadDashboardData();
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 p-4 border border-zinc-800 dark:border-zinc-200 z-50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-mono uppercase font-bold tracking-wider">{toastMessage.title}</h5>
            <p className="text-xs text-zinc-300 dark:text-zinc-700 mt-0.5">{toastMessage.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white dark:hover:text-black"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
