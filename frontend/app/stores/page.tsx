'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StoreCard from '@/components/StoreCard';
import RatingModal from '@/components/RatingModal';
import ReviewsModal from '@/components/ReviewsModal';
import {
  Search,
  Compass,
  Trophy,
  Star,
  Sparkles,
  ShoppingBag,
  Building2,
  Shirt,
  Laptop,
  Coffee,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  MapPin,
  RefreshCw,
  AlertCircle,
  Filter,
  UserCheck,
  ArrowRight,
  TrendingUp,
  LogIn,
} from 'lucide-react';

// Dynamically import StoreMap to avoid SSR WebGL context issues
const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-amber-500 animate-bounce" />
        <span className="text-sm font-semibold">Loading interactive store map...</span>
      </div>
    </div>
  ),
});

const CATEGORIES = [
  { id: 'All', label: 'All Stores', icon: LayoutGrid },
  { id: 'Grocery', label: 'Grocery', icon: ShoppingBag },
  { id: 'Malls', label: 'Malls', icon: Building2 },
  { id: 'Clothes', label: 'Clothes', icon: Shirt },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Bakery', label: 'Bakery & Cafe', icon: Coffee },
];

export default function StoresPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('highest');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');
  const [selectedMapStoreId, setSelectedMapStoreId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [selectedReviewStore, setSelectedReviewStore] = useState<Store | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.stores.getAll();
      setStores(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Filter & Sort stores
  const filteredAndSortedStores = useMemo(() => {
    let result = [...stores];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (store) => store.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Search Query (name, address, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(q) ||
          store.address.toLowerCase().includes(q) ||
          (store.category && store.category.toLowerCase().includes(q)),
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'highest':
          return (b.averageRating ?? -1) - (a.averageRating ?? -1);
        case 'lowest':
          return (a.averageRating ?? 999) - (b.averageRating ?? 999);
        case 'reviews':
          return (b.totalRatings || 0) - (a.totalRatings || 0);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [stores, selectedCategory, searchQuery, sortOrder]);

  // Top rated featured highlights for top banner
  const topRatedStores = useMemo(() => {
    return [...stores]
      .filter((s) => s.averageRating !== null && s.averageRating > 0)
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
      .slice(0, 3);
  }, [stores]);

  const handleOpenRating = (store: Store) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleOpenReviews = (store: Store) => {
    setSelectedReviewStore(store);
    setIsReviewsModalOpen(true);
  };

  const handleRatingSuccess = () => {
    fetchStores();
  };

  const handleLocateOnMap = (store: Store) => {
    setSelectedMapStoreId(store.id);
    if (viewMode === 'grid') {
      setViewMode('split');
    }
    const mapEl = document.getElementById('store-map-container');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Guest Mode Discovery Notice */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Browsing as a Guest
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                You can browse verified stores, check live GPS coordinates, and read community reviews freely. Log in anytime to submit your own ratings!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Rate</span>
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Header & Search Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2 border border-amber-200 dark:border-amber-900/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Directory & Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Explore Verified Stores
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Browse verified local shops, compare ratings from 1 to 5 stars, examine customer photos, and navigate with interactive GPS mapping.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              viewMode === 'map'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Top Rated Leaderboard Strip */}
      {topRatedStores.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 border border-amber-200/40 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Community Top Picks
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topRatedStores.map((s, idx) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 hover:border-amber-400/60 transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-amber-600 transition">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center text-amber-500 font-semibold">
                      ★ {s.averageRating}
                    </span>
                    <span>•</span>
                    <span>{s.category || 'Shop'}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search stores by name, category, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="highest">★ Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>

            <button
              type="button"
              onClick={fetchStores}
              disabled={isLoading}
              title="Refresh store listings"
              className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            />
          ))}
        </div>
      ) : filteredAndSortedStores.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No matching stores found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or clearing the filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* 1. Grid View */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Showing {filteredAndSortedStores.length} stores</span>
                <span>Click any store to view full page, ratings & photo gallery</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onRate={handleOpenRating}
                    onViewReviews={handleOpenReviews}
                    onLocateOnMap={handleLocateOnMap}
                    currentUserRole={user?.role}
                    isAuthenticated={isAuthenticated}
                    onLoginPrompt={() => router.push('/login')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Full Map View */}
          {viewMode === 'map' && (
            <div id="store-map-container" className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Map view • {filteredAndSortedStores.length} stores mapped</span>
                <span>Click markers to view details, photos, and ratings</span>
              </div>
              <div className="w-full h-[620px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
                <StoreMap
                  stores={filteredAndSortedStores}
                  selectedStoreId={selectedMapStoreId}
                  onSelectStore={(s) => setSelectedMapStoreId(s.id)}
                  onOpenReviews={handleOpenReviews}
                  onOpenRating={handleOpenRating}
                />
              </div>
            </div>
          )}

          {/* 3. Split View (Side-by-side Map and List) */}
          {viewMode === 'split' && (
            <div id="store-map-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Store Cards Column */}
              <div className="lg:col-span-5 space-y-4 order-2 lg:order-1 max-h-[720px] overflow-y-auto pr-1">
                <div className="text-xs text-zinc-500 px-1">
                  Showing {filteredAndSortedStores.length} stores
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {filteredAndSortedStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onRate={handleOpenRating}
                      onViewReviews={handleOpenReviews}
                      onLocateOnMap={handleLocateOnMap}
                      currentUserRole={user?.role}
                      isAuthenticated={isAuthenticated}
                      onLoginPrompt={() => router.push('/login')}
                    />
                  ))}
                </div>
              </div>

              {/* Map Column (Sticky) */}
              <div className="lg:col-span-7 lg:sticky lg:top-24 order-1 lg:order-2 h-[500px] lg:h-[720px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
                <StoreMap
                  stores={filteredAndSortedStores}
                  selectedStoreId={selectedMapStoreId}
                  onSelectStore={(s) => setSelectedMapStoreId(s.id)}
                  onOpenReviews={handleOpenReviews}
                  onOpenRating={handleOpenRating}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Rating Modal */}
      {selectedStore && (
        <RatingModal
          store={selectedStore}
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Reviews Modal */}
      <ReviewsModal
        store={selectedReviewStore}
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        onRateClick={handleOpenRating}
      />
    </div>
  );
}
