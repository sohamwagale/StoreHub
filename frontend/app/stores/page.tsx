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
  LogIn,
  ArrowRight,
} from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-300 dark:border-zinc-700">
      <div className="flex items-center gap-2 font-mono text-xs uppercase">
        <MapPin className="w-4 h-4 text-amber-500" />
        <span>Loading map...</span>
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

    if (selectedCategory !== 'All') {
      result = result.filter(
        (store) => store.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(q) ||
          store.address.toLowerCase().includes(q) ||
          (store.category && store.category.toLowerCase().includes(q)),
      );
    }

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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Guest Mode Discovery Notice */}
      {!isAuthenticated && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-950 dark:border-white">
              <Compass className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Guest Access Active
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Browse stores, check coordinates, and read community reviews freely. Log in anytime to submit your own ratings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Sign In to Rate</span>
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            Directory & Discovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-0.5">
            Explore Verified Stores
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Browse verified local shops, compare ratings from 1 to 5 stars, inspect customer photos, and navigate with GPS mapping.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-0.5 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
              viewMode === 'map'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
              viewMode === 'split'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Top Rated Strip */}
      {topRatedStores.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
              Community Top Picks
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topRatedStores.map((s, idx) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="group flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors"
              >
                <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white truncate group-hover:underline transition">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-amber-500 font-bold">
                      ★ {s.averageRating}
                    </span>
                    <span>•</span>
                    <span>{s.category || 'Shop'}</span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search stores by name, category, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-950 cursor-pointer"
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
              className="p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold shrink-0 transition-colors border ${
                  isSelected
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {error && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredAndSortedStores.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-8">
          <div className="w-10 h-10 mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-500 mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
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
            className="mt-4 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* 1. Grid View */}
          {viewMode === 'grid' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Showing {filteredAndSortedStores.length} stores</span>
                <span>Click store card for complete profile & gallery</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div id="store-map-container" className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Map view • {filteredAndSortedStores.length} stores mapped</span>
                <span>Click markers to view details</span>
              </div>
              <div className="w-full h-[620px] overflow-hidden border border-zinc-300 dark:border-zinc-700">
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

          {/* 3. Split View */}
          {viewMode === 'split' && (
            <div id="store-map-container" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Store Cards Column */}
              <div className="lg:col-span-5 space-y-3 order-2 lg:order-1 max-h-[720px] overflow-y-auto pr-1">
                <div className="text-[11px] font-mono text-zinc-500">
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
              <div className="lg:col-span-7 lg:sticky lg:top-20 order-1 lg:order-2 h-[500px] lg:h-[720px] overflow-hidden border border-zinc-300 dark:border-zinc-700">
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
