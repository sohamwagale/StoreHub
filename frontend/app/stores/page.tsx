'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StoreCard from '@/components/StoreCard';
import { StoreCardSkeletonGrid } from '@/components/Skeleton';
import RatingModal from '@/components/RatingModal';
import ReviewsModal from '@/components/ReviewsModal';
import StoreFilters from '@/components/StoreFilters';
import StoreViewModeSwitch, { ViewMode } from '@/components/StoreViewModeSwitch';
import StoreEmptyState from '@/components/StoreEmptyState';
import { Compass, MapPin, AlertCircle } from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] bg-muted-fill flex items-center justify-center text-muted border border-border">
      <div className="flex items-center gap-2 font-mono text-xs uppercase">
        <MapPin className="w-4 h-4 text-accent" />
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

export default function StoresPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('highest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchQuery(q);
      const cat = params.get('category');
      if (cat) setSelectedCategory(cat);
    }
  }, []);

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
      {/* Guest Mode Notice */}
      {!isAuthenticated && (
        <div className="px-3.5 py-2 bg-muted-fill border border-border flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted truncate">
            <Compass className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">Guest mode: Browse stores freely. Sign in to submit ratings.</span>
          </div>
          <Link
            href="/login"
            className="font-bold uppercase tracking-wider text-foreground underline hover:no-underline shrink-0 text-[11px]"
          >
            Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-0.5">
            Explore Stores
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Verified local shops, authentic customer evaluations, and real-time community ratings.
          </p>
        </div>

        <StoreViewModeSwitch viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Filter and Search Bar */}
      <StoreFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onRefresh={fetchStores}
        isLoading={isLoading}
        totalResults={filteredAndSortedStores.length}
      />

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-muted-fill border-l-2 border-red-500 flex items-start gap-3 text-foreground text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Content Area based on View Mode */}
      {isLoading ? (
        <StoreCardSkeletonGrid count={6} />
      ) : filteredAndSortedStores.length === 0 ? (
        <StoreEmptyState
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <>
          {/* 1. Grid View */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted">
                <span>{filteredAndSortedStores.length} {filteredAndSortedStores.length === 1 ? 'store' : 'stores'} found</span>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted">
                <span>Interactive map view • Click on any store marker for quick details</span>
              </div>
              <div
                id="store-map-container"
                className="w-full h-[640px] bg-surface border border-border overflow-hidden"
              >
                <StoreMap
                  stores={filteredAndSortedStores}
                  selectedStoreId={selectedMapStoreId || undefined}
                  onStoreSelect={(store) => {
                    setSelectedMapStoreId(store.id);
                  }}
                  onRate={handleOpenRating}
                  onViewReviews={handleOpenReviews}
                  height="100%"
                />
              </div>
            </div>
          )}

          {/* 3. Split View */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-5 space-y-4 max-h-[720px] overflow-y-auto pr-1">
                <div className="text-xs font-mono text-muted">
                  <span>{filteredAndSortedStores.length} stores nearby</span>
                </div>
                <div className="space-y-4">
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

              <div
                id="store-map-container"
                className="lg:col-span-7 h-[720px] sticky top-20 bg-surface border border-border overflow-hidden"
              >
                <StoreMap
                  stores={filteredAndSortedStores}
                  selectedStoreId={selectedMapStoreId || undefined}
                  onStoreSelect={(store) => {
                    setSelectedMapStoreId(store.id);
                  }}
                  onRate={handleOpenRating}
                  onViewReviews={handleOpenReviews}
                  height="100%"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedStore && (
        <RatingModal
          isOpen={isRatingModalOpen}
          store={selectedStore}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedStore(null);
          }}
          onSuccess={() => {
            setIsRatingModalOpen(false);
            setSelectedStore(null);
            fetchStores();
          }}
        />
      )}

      {selectedReviewStore && (
        <ReviewsModal
          isOpen={isReviewsModalOpen}
          store={selectedReviewStore}
          onClose={() => {
            setIsReviewsModalOpen(false);
            setSelectedReviewStore(null);
          }}
          onRateClick={(store) => {
            setIsReviewsModalOpen(false);
            handleOpenRating(store);
          }}
        />
      )}
    </div>
  );
}
