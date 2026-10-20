'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StoreCard from '@/components/StoreCard';
import RatingModal from '@/components/RatingModal';
import ReviewsModal from '@/components/ReviewsModal';
import {
  Search,
  Store as StoreIcon,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Building2,
  Shirt,
  Laptop,
  Coffee,
  LayoutGrid,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Stores', icon: LayoutGrid },
  { id: 'Grocery', label: 'Grocery', icon: ShoppingBag },
  { id: 'Malls', label: 'Malls', icon: Building2 },
  { id: 'Clothes', label: 'Clothes', icon: Shirt },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Bakery', label: 'Bakery & Cafe', icon: Coffee },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Reviews View Modal state
  const [selectedReviewStore, setSelectedReviewStore] = useState<Store | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);

  const fetchStores = useCallback(async (query?: string, category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.stores.getAll(query, category);
      setStores(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load stores. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores(searchQuery, selectedCategory);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, fetchStores]);

  const handleOpenRateModal = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleOpenReviewsModal = (store: Store) => {
    setSelectedReviewStore(store);
    setIsReviewsModalOpen(true);
  };

  const handleLoginPrompt = () => {
    router.push('/login');
  };

  const handleRatingSuccess = () => {
    fetchStores(searchQuery, selectedCategory);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-4 border border-amber-200 dark:border-amber-800/60 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Real Opinions • Categorized Directory • Transparent Ratings</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
          Find top-rated stores & share your honest reviews.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explore stores across popular categories like Groceries, Shopping Malls, Fashion Apparel, and Tech. Submit your verified 1–5 star ratings anytime.
        </p>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name, address, or category..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-zinc-900 dark:text-white placeholder-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-md shadow-zinc-900/10 dark:shadow-amber-500/20 scale-105'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {selectedCategory !== 'All'
                ? `${selectedCategory} Stores`
                : searchQuery
                ? `Results for "${searchQuery}"`
                : 'All Stores'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {stores.length}
            </span>
          </div>

          <button
            onClick={() => fetchStores(searchQuery, selectedCategory)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            title="Refresh store listing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load stores</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800 animate-pulse space-y-4"
              >
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-md w-1/2" />
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && stores.length === 0 && !error && (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
              <StoreIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {searchQuery || selectedCategory !== 'All'
                ? 'No matching stores found'
                : 'No stores registered yet'}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              {searchQuery || selectedCategory !== 'All'
                ? `No stores matched your selected filters. Try choosing a different category or clearing search terms.`
                : 'Registered stores will appear here once owners add them.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Store Grid */}
        {!isLoading && stores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onRate={handleOpenRateModal}
                onViewReviews={handleOpenReviewsModal}
                currentUserRole={user?.role}
                isAuthenticated={!!user}
                onLoginPrompt={handleLoginPrompt}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Rating Modal */}
      <RatingModal
        store={selectedStore}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRatingSuccess}
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
