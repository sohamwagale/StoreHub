'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StoreCard from '@/components/StoreCard';
import RatingModal from '@/components/RatingModal';
import ReviewsModal from '@/components/ReviewsModal';
import {
  Compass,
  Trophy,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  ShoppingBag,
  Building2,
  Shirt,
  Laptop,
  Coffee,
  LayoutGrid,
  Loader2,
  AlertCircle,
  RefreshCw,
  Map as MapIcon,
  MapPin,
} from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-amber-500 animate-bounce" />
        <span className="text-sm font-semibold">Loading discovery map...</span>
      </div>
    </div>
  ),
});

const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: LayoutGrid },
  { id: 'Grocery', label: 'Grocery', icon: ShoppingBag },
  { id: 'Malls', label: 'Malls', icon: Building2 },
  { id: 'Clothes', label: 'Clothes', icon: Shirt },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Bakery', label: 'Bakery & Cafe', icon: Coffee },
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortMode, setSortMode] = useState<'rating' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedMapStoreId, setSelectedMapStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [selectedReviewStore, setSelectedReviewStore] = useState<Store | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.stores.getAll();
      setStores(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Filter and sort discovered stores
  const discoveredStores = useMemo(() => {
    let list = [...stores];

    if (selectedCategory !== 'All') {
      list = list.filter(
        (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (sortMode === 'rating') {
      // Highest rating first (null ratings to the end)
      list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else {
      // Most reviews first
      list.sort((a, b) => b.totalRatings - a.totalRatings);
    }

    return list;
  }, [stores, selectedCategory, sortMode]);

  // Spotlight store: highest rated with ratings
  const topSpotlightStore = useMemo(() => {
    const ratedStores = stores.filter((s) => s.averageRating !== null && s.totalRatings > 0);
    if (ratedStores.length === 0) return null;
    return [...ratedStores].sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
    )[0];
  }, [stores]);

  const handleOpenRateModal = (store: Store) => {
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleOpenReviewsModal = (store: Store) => {
    setSelectedReviewStore(store);
    setIsReviewsModalOpen(true);
  };

  const handleLocateOnMap = (store: Store) => {
    setSelectedMapStoreId(store.id);
    setViewMode('map');
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Discovery Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold mb-3 border border-amber-200 dark:border-amber-800 shadow-sm">
          <Compass className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Curated Recommendations & GPS Map Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Discover Places Highly Rated by Shoppers
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Looking for where to visit next? Explore stores sorted by verified community satisfaction, highest average star ratings, customer photos, and real GPS locations.
        </p>
      </div>

      {/* Top Spotlight Banner */}
      {topSpotlightStore && (
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-200" />
                <span>#1 Community Favorite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {topSpotlightStore.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg">
                {topSpotlightStore.address} •{' '}
                <span className="font-semibold underline decoration-white/50">
                  {topSpotlightStore.category || 'General Store'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-black">
                  {topSpotlightStore.averageRating?.toFixed(1)}
                </div>
                <div className="text-[11px] font-semibold text-white/80">
                  ★ Average Score
                </div>
              </div>
              <div className="h-10 w-[1px] bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black">
                  {topSpotlightStore.totalRatings}
                </div>
                <div className="text-[11px] font-semibold text-white/80">
                  Customer Reviews
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenReviewsModal(topSpotlightStore)}
                className="ml-2 px-4 py-2 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-colors shadow-md"
              >
                Read Reviews
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Controls: Sort, View Switcher and Category Tabs */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          {/* Sort Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setSortMode('rating')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                sortMode === 'rating'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Highest Rated First</span>
            </button>
            <button
              onClick={() => setSortMode('reviews')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                sortMode === 'reviews'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Most Reviewed</span>
            </button>
          </div>

          {/* View Mode & Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>

            <button
              onClick={fetchStores}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm scale-105'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores List */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : discoveredStores.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Sparkles className="w-8 h-8 mx-auto text-amber-400 mb-2" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No stores found in this category
          </h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Try switching categories to discover more recommended shops.
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="px-4 py-2 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          >
            Show All Categories
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <StoreMap
            stores={discoveredStores}
            selectedStoreId={selectedMapStoreId}
            onSelectStore={(st) => setSelectedMapStoreId(st.id)}
            onOpenRating={handleOpenRateModal}
            onOpenReviews={handleOpenReviewsModal}
            heightClass="h-[600px]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoveredStores.map((store, index) => (
            <div key={store.id} className="relative flex flex-col">
              {/* Leaderboard Rank Tag for Top 3 */}
              {index < 3 && (
                <div className="absolute -top-3 left-4 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                  <Trophy className="w-3 h-3" />
                  <span>#{index + 1} Top Pick</span>
                </div>
              )}

              <StoreCard
                store={store}
                onRate={handleOpenRateModal}
                onViewReviews={handleOpenReviewsModal}
                onLocateOnMap={handleLocateOnMap}
                currentUserRole={user?.role}
                isAuthenticated={!!user}
                onLoginPrompt={() => router.push('/login')}
              />
            </div>
          ))}
        </div>
      )}

      {/* Rating & Review Modal */}
      <RatingModal
        store={selectedStore}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSuccess={fetchStores}
      />

      {/* Community Reviews Modal */}
      <ReviewsModal
        store={selectedReviewStore}
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        onRateClick={handleOpenRateModal}
      />
    </div>
  );
}
