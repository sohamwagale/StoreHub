'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, StoreReview, StoreGallery } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/StarRating';
import RatingModal from '@/components/RatingModal';
import {
  ArrowLeft,
  MapPin,
  Star,
  Camera,
  Upload,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageSquare,
  Share2,
  Navigation,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Loader2,
  AlertCircle,
  X,
  Maximize2,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-amber-500 animate-bounce" />
        <span className="text-sm font-semibold">Loading store map...</span>
      </div>
    </div>
  ),
});

function StoreDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;

  const { user } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [gallery, setGallery] = useState<StoreGallery | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review sort mode
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('helpful');

  // Modals & UI States
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  const loadStoreDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [storeData, reviewsData, galleryData] = await Promise.all([
        api.stores.getById(storeId),
        api.stores.getReviews(storeId),
        api.stores.getGallery(storeId).catch(() => null),
      ]);
      setStore(storeData);
      setReviews(reviewsData);
      setGallery(galleryData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load store information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      loadStoreDetails();
    }
  }, [storeId]);

  // Handle Photo Upload
  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !store) return;

    if (!user) {
      router.push('/login');
      return;
    }

    setIsUploadingPhoto(true);
    setError(null);
    setUploadSuccess(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      await api.stores.addPhotos(store.id, res.urls);
      setUploadSuccess('Photos uploaded successfully to this shop!');
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Handle Review Like / Dislike Vote
  const handleVote = async (reviewId: string, voteType: 'LIKE' | 'DISLIKE') => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;

        let newLikes = r.likesCount || 0;
        let newDislikes = r.dislikesCount || 0;
        let newVote: 'LIKE' | 'DISLIKE' | null = null;

        if (voteType === 'LIKE') {
          if (r.userVote === 'LIKE') {
            newLikes = Math.max(0, newLikes - 1);
            newVote = null;
          } else {
            newLikes += 1;
            if (r.userVote === 'DISLIKE') {
              newDislikes = Math.max(0, newDislikes - 1);
            }
            newVote = 'LIKE';
          }
        } else if (voteType === 'DISLIKE') {
          if (r.userVote === 'DISLIKE') {
            newDislikes = Math.max(0, newDislikes - 1);
            newVote = null;
          } else {
            newDislikes += 1;
            if (r.userVote === 'LIKE') {
              newLikes = Math.max(0, newLikes - 1);
            }
            newVote = 'DISLIKE';
          }
        }

        return {
          ...r,
          likesCount: newLikes,
          dislikesCount: newDislikes,
          userVote: newVote,
        };
      }),
    );

    try {
      const res = await api.ratings.vote(reviewId, voteType);
      // Sync with server confirmation
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...res } : r)),
      );
    } catch (err: any) {
      // Revert if error
      setError(err?.message || 'Failed to register vote. You cannot vote on your own review.');
      loadStoreDetails();
    }
  };

  // Copy GPS Coordinates to Clipboard
  const handleCopyCoords = () => {
    if (store && store.latitude !== undefined && store.longitude !== undefined) {
      navigator.clipboard.writeText(`${store.latitude}, ${store.longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  // Rating Distribution Calculation (5★ to 1★)
  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const score = Math.round(r.rating);
      if (counts[score] !== undefined) {
        counts[score] += 1;
      }
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percentage: Math.round((counts[star] / total) * 100),
    }));
  }, [reviews]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'helpful') {
      list.sort((a, b) => ((b.likesCount || 0) - (b.dislikesCount || 0)) - ((a.likesCount || 0) - (a.dislikesCount || 0)));
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [reviews, sortBy]);

  // Aggregate all photos
  const allPhotos = useMemo(() => {
    const photos: string[] = [];
    if (store?.photos) photos.push(...store.photos);
    if (gallery?.customerPhotos) {
      gallery.customerPhotos.forEach((cp) => {
        if (!photos.includes(cp.url)) photos.push(cp.url);
      });
    }
    return photos;
  }, [store, gallery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-28 text-zinc-400">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold">Loading shop profile & reviews...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Shop Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-6">{error || 'This store does not exist or has been removed.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Directory</span>
        </Link>
      </div>
    );
  }

  const userHasRated = store.userRating !== null && store.userRating !== undefined;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {store.category || 'General Store'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              Verified Place
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-xs text-zinc-500">{store.category || 'Retail & Services'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {store.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{store.address}</span>
            </div>

            {store.latitude !== undefined && store.longitude !== undefined && (
              <button
                type="button"
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition"
                title="Click to copy GPS coordinates"
              >
                <Navigation className="w-3 h-3 text-indigo-500" />
                <span>GPS: {store.latitude.toFixed(4)}°, {store.longitude.toFixed(4)}°</span>
                {copiedCoords ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-50" />}
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Rate Store */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition shadow-sm">
            {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-amber-500" />}
            <span>{isUploadingPhoto ? 'Uploading...' : 'Add Photos'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadPhotos}
              disabled={isUploadingPhoto}
              className="hidden"
            />
          </label>

          {user?.role !== 'OWNER' && (
            <button
              type="button"
              onClick={() => {
                if (!user) router.push('/login');
                else setIsRatingModalOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/20 transition active:scale-95"
            >
              {userHasRated ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              <span>{userHasRated ? 'Update My Rating' : 'Rate this Store'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Photos Carousel & Visual Gallery */}
      {allPhotos.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Photos & Visual Tour ({allPhotos.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400">Click any photo to expand</span>
          </div>

          {/* Large Main Photo */}
          <div
            onClick={() => setLightboxImage(allPhotos[activePhotoIndex])}
            className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-zinc-950 cursor-pointer group shadow-inner"
          >
            <img
              src={allPhotos[activePhotoIndex]}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-4 text-white">
              <span className="text-xs font-medium bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                Photo {activePhotoIndex + 1} of {allPhotos.length}
              </span>
              <button
                type="button"
                className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails Strip */}
          <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin">
            {allPhotos.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activePhotoIndex === idx
                    ? 'border-amber-500 scale-105 ring-2 ring-amber-400/40'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview Grid: Ratings Scorecard & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Rating Scorecard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Customer Ratings Overview
            </h3>

            {/* Scorecard Hero */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <div className="text-center shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white">
                  {store.averageRating !== null ? store.averageRating.toFixed(1) : '-'}
                </div>
                <div className="text-xs font-semibold text-zinc-400 mt-1">out of 5.0</div>
              </div>

              <div className="space-y-1.5 border-l border-zinc-200 dark:border-zinc-700 pl-6">
                <StarRating rating={store.averageRating} size="md" />
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Based on <span className="font-bold text-zinc-900 dark:text-white">{store.totalRatings}</span> verified shopper ratings
                </div>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="space-y-2 pt-2">
              {ratingDistribution.map((item) => (
                <div key={item.star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-zinc-700 dark:text-zinc-300 font-bold shrink-0">
                    <span>{item.star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-zinc-400 font-medium shrink-0">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>

            {/* User rating banner */}
            {userHasRated && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You rated this store <strong>{store.userRating}★</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="font-bold underline hover:text-emerald-950"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Interactive Store Map Preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Location on Map
                </h3>
              </div>
              <span className="text-xs text-zinc-400">MapLibre GL GPS</span>
            </div>

            <StoreMap
              stores={[store]}
              selectedStoreId={store.id}
              heightClass="h-72"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
              <Navigation className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{store.address}</span>
            </p>
          </div>
        </div>

        {/* Right Column: Customer Reviews & Voting */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
            {/* Header & Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Community Reviews
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {reviews.length}
                </span>
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-xs text-zinc-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="helpful">Most Helpful (Likes)</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                  No written reviews yet
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
                  Be the first visitor to share details about service, products, or ambiance at {store.name}.
                </p>
                {user?.role !== 'OWNER' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) router.push('/login');
                      else setIsRatingModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 transition space-y-3"
                  >
                    {/* User and Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span>{rev.user?.name || 'Verified Shopper'}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-xs">
                        <span className="text-xs font-bold text-amber-500">
                          ★ {rev.rating}
                        </span>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                    </div>

                    {/* Review text */}
                    {rev.review ? (
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        "{rev.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        Rated {rev.rating} stars without written comments.
                      </p>
                    )}

                    {/* Attached Photos Carousel */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {rev.photos.map((photoUrl, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setLightboxImage(photoUrl)}
                            className="relative group w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-sm"
                          >
                            <img
                              src={photoUrl}
                              alt="Review photo"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Like / Dislike Community Voting Footer */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                      <span className="text-[11px] text-zinc-400">
                        Was this review helpful?
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleVote(rev.id, 'LIKE')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                            rev.userVote === 'LIKE'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 font-bold'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${rev.userVote === 'LIKE' ? 'fill-amber-500 text-amber-500' : ''}`} />
                          <span>{rev.likesCount || 0}</span>
                        </button>

                        {/* Dislike Button */}
                        <button
                          type="button"
                          onClick={() => handleVote(rev.id, 'DISLIKE')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                            rev.userVote === 'DISLIKE'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 font-bold'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-rose-400'
                          }`}
                        >
                          <ThumbsDown className={`w-3.5 h-3.5 ${rev.userVote === 'DISLIKE' ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{rev.dislikesCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating & Review Modal */}
      <RatingModal
        store={store}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSuccess={loadStoreDetails}
      />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Expanded photo view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StoreLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-6" />
      <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    </div>
  );
}

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<StoreLoadingSkeleton />}>
      <StoreDetailContent params={params} />
    </Suspense>
  );
}
