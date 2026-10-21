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
} from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
      <div className="flex items-center gap-2 font-mono text-xs uppercase">
        <MapPin className="w-4 h-4 text-amber-500" />
        <span>Loading map...</span>
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

  // Handle Review Vote
  const handleVote = async (reviewId: string, voteType: 'LIKE' | 'DISLIKE') => {
    if (!user) {
      router.push('/login');
      return;
    }

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
            if (r.userVote === 'DISLIKE') newDislikes = Math.max(0, newDislikes - 1);
            newVote = 'LIKE';
          }
        } else if (voteType === 'DISLIKE') {
          if (r.userVote === 'DISLIKE') {
            newDislikes = Math.max(0, newDislikes - 1);
            newVote = null;
          } else {
            newDislikes += 1;
            if (r.userVote === 'LIKE') newLikes = Math.max(0, newLikes - 1);
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
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...res } : r)),
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to register vote. You cannot vote on your own review.');
      loadStoreDetails();
    }
  };

  const handleCopyCoords = () => {
    if (store && store.latitude !== undefined && store.longitude !== undefined) {
      navigator.clipboard.writeText(`${store.latitude}, ${store.longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

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
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider">Loading store details...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">Shop Not Found</h2>
        <p className="text-xs text-zinc-500 mt-2 mb-6">{error || 'This store does not exist or has been removed.'}</p>
        <Link
          href="/stores"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono uppercase font-bold border border-zinc-950 dark:border-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store Directory</span>
        </Link>
      </div>
    );
  }

  const userHasRated = store.userRating !== null && store.userRating !== undefined;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Stores</span>
        </Link>

        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
          {store.category || 'General Store'}
        </span>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-emerald-500 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Store Header Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-500">
              Verified Place
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-xs font-mono text-zinc-500">{store.category || 'Retail & Services'}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {store.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{store.address}</span>
            </div>

            {store.latitude !== undefined && store.longitude !== undefined && (
              <button
                type="button"
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 transition-colors"
                title="Click to copy GPS coordinates"
              >
                <Navigation className="w-3 h-3 text-zinc-500" />
                <span>GPS: {store.latitude.toFixed(4)}°, {store.longitude.toFixed(4)}°</span>
                {copiedCoords ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-50" />}
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Rate Store */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors">
            {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-zinc-600" />}
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              {userHasRated ? <Edit3 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>{userHasRated ? 'Update Rating' : 'Rate this Store'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Photos Carousel & Visual Gallery */}
      {allPhotos.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-zinc-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Photos ({allPhotos.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Click photo to expand</span>
          </div>

          {/* Large Main Photo */}
          <div
            onClick={() => setLightboxImage(allPhotos[activePhotoIndex])}
            className="relative w-full h-72 sm:h-96 overflow-hidden bg-zinc-950 cursor-pointer group border border-zinc-800"
          >
            <img
              src={allPhotos[activePhotoIndex]}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute bottom-3 left-3 bg-zinc-950 text-white text-[10px] font-mono px-2 py-0.5 border border-white/20">
              {activePhotoIndex + 1} of {allPhotos.length}
            </div>
            <button
              type="button"
              className="absolute bottom-3 right-3 p-1.5 bg-zinc-950 text-white border border-white/20 hover:bg-zinc-800 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Thumbnails Strip */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {allPhotos.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-16 h-16 shrink-0 border transition-all ${
                  activePhotoIndex === idx
                    ? 'border-zinc-950 dark:border-white ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-300 dark:border-zinc-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview Grid: Ratings Scorecard & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rating Scorecard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Customer Ratings Overview
            </h3>

            {/* Scorecard Hero */}
            <div className="flex items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="text-center shrink-0">
                <div className="text-4xl font-mono font-black text-zinc-950 dark:text-white">
                  {store.averageRating !== null ? store.averageRating.toFixed(1) : '-'}
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">out of 5.0</div>
              </div>

              <div className="space-y-1 border-l border-zinc-300 dark:border-zinc-700 pl-5">
                <StarRating rating={store.averageRating} size="md" />
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold text-zinc-950 dark:text-white">{store.totalRatings}</span> verified ratings
                </div>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="space-y-1.5 pt-1">
              {ratingDistribution.map((item) => (
                <div key={item.star} className="flex items-center gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1 w-10 text-zinc-700 dark:text-zinc-300 font-bold shrink-0">
                    <span>{item.star}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 dark:bg-zinc-100 transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-zinc-400 font-mono text-[11px] shrink-0">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>

            {/* User rating banner */}
            {userHasRated && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>You rated this store <strong>{store.userRating}★</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="font-bold uppercase tracking-wider text-zinc-950 dark:text-white underline hover:no-underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Interactive Store Map Preview */}
          <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                  Location on Map
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">GPS Map</span>
            </div>

            <StoreMap
              stores={[store]}
              selectedStoreId={store.id}
              heightClass="h-72"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 pt-1">
              <Navigation className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{store.address}</span>
            </p>
          </div>
        </div>

        {/* Right Column: Customer Reviews & Voting */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 space-y-4">
            {/* Header & Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                  Community Reviews
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  {reviews.length}
                </span>
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-mono text-zinc-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-2 py-1 text-xs font-mono uppercase bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-14 text-zinc-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  No written reviews yet
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
                  Be the first visitor to share details about service and products at {store.name}.
                </p>
                {user?.role !== 'OWNER' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) router.push('/login');
                      else setIsRatingModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                  >
                    {/* User and Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-600">
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                            <span>{rev.user?.name || 'Verified Shopper'}</span>
                            <span className="text-[9px] font-mono uppercase bg-zinc-200 dark:bg-zinc-700 px-1 py-0.2 text-zinc-700 dark:text-zinc-300">
                              Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                        <span className="text-xs font-mono font-bold text-amber-500">
                          ★ {rev.rating}
                        </span>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                    </div>

                    {/* Review text */}
                    {rev.review ? (
                      <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed pl-9">
                        "{rev.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic pl-9">
                        Rated {rev.rating} stars without written comments.
                      </p>
                    )}

                    {/* Attached Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1 pl-9">
                        {rev.photos.map((photoUrl, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setLightboxImage(photoUrl)}
                            className="relative group w-16 h-16 shrink-0 border border-zinc-300 dark:border-zinc-700 cursor-pointer bg-zinc-100 dark:bg-zinc-800"
                          >
                            <img
                              src={photoUrl}
                              alt="Review photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Maximize2 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Like / Dislike Community Voting Footer */}
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 pl-9">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Helpful?
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVote(rev.id, 'LIKE')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border transition-colors ${
                            rev.userVote === 'LIKE'
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${rev.userVote === 'LIKE' ? 'fill-current text-amber-400' : ''}`} />
                          <span>{rev.likesCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVote(rev.id, 'DISLIKE')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border transition-colors ${
                            rev.userVote === 'DISLIKE'
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
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
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden border border-zinc-700 bg-black">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/80 text-white hover:bg-black border border-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxImage}
              alt="Expanded photo view"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StoreLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-44 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
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
