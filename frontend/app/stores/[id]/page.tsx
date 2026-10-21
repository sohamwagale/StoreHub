'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, StoreReview, StoreGallery } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/StarRating';
import {
  ArrowLeft,
  MapPin,
  Star,
  Camera,
  Upload,
  ThumbsUp,
  Clock,
  Navigation,
  CheckCircle2,
  Edit3,
  Loader2,
  AlertCircle,
  X,
  Maximize2,
  Check,
  Copy,
  Bookmark,
  Share2,
  Flag,
  Shield,
  Phone,
  Globe,
  Store as StorefrontIcon,
  Laptop,
  ShoppingBag,
  Building2,
  Shirt,
  Coffee,
  CheckCircle,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
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
  const [similarStores, setSimilarStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review sort mode & filter
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterStar, setFilterStar] = useState<number | 'all' | 'photos'>('all');

  // Interactive user rating in-line state
  const [isEditingRating, setIsEditingRating] = useState<boolean>(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewHeadline, setReviewHeadline] = useState<string>('');
  const [reviewBody, setReviewBody] = useState<string>('');
  const [certifyTruthful, setCertifyTruthful] = useState<boolean>(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [isDeletingRating, setIsDeletingRating] = useState<boolean>(false);

  // Bookmarking state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Modals & UI States
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);

  // Toast helper
  const triggerToast = (title: string, body: string) => {
    setToastMessage({ title, body });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadStoreDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [storeData, reviewsData, galleryData, allStores] = await Promise.all([
        api.stores.getById(storeId),
        api.stores.getReviews(storeId),
        api.stores.getGallery(storeId).catch(() => null),
        api.stores.getAll().catch(() => []),
      ]);
      setStore(storeData);
      setReviews(reviewsData);
      setGallery(galleryData);

      // Find 2 similar stores in the same category (excluding current)
      const similar = (allStores || [])
        .filter((s) => s.id !== storeId && s.category === storeData.category)
        .slice(0, 2);
      setSimilarStores(similar.length > 0 ? similar : (allStores || []).filter((s) => s.id !== storeId).slice(0, 2));

      // If user has rated, pre-fill rating score and review body
      if (storeData.userRating) {
        setRatingScore(storeData.userRating);
        const myReview = reviewsData.find((r) => r.user?.id === user?.id);
        if (myReview) {
          setReviewBody(myReview.review || '');
        }
      }
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
  }, [storeId, user?.id]);

  // Load bookmark state from backend or local fallback
  useEffect(() => {
    if (user && storeId) {
      api.users.getBookmarks()
        .then((bookmarks) => {
          setIsBookmarked(bookmarks.some((b) => b.id === storeId));
        })
        .catch(() => {
          try {
            const saved = localStorage.getItem('bookmarked_stores');
            if (saved) {
              const ids: string[] = JSON.parse(saved);
              setIsBookmarked(ids.includes(storeId));
            }
          } catch {}
        });
    } else {
      try {
        const saved = localStorage.getItem('bookmarked_stores');
        if (saved) {
          const ids: string[] = JSON.parse(saved);
          setIsBookmarked(ids.includes(storeId));
        }
      } catch {}
    }
  }, [storeId, user]);

  const toggleBookmark = async () => {
    if (user) {
      try {
        const res = await api.users.toggleBookmark(storeId);
        setIsBookmarked(res.isBookmarked);
        if (res.isBookmarked) {
          triggerToast('Store Saved', 'Store was added to your bookmarked collection.');
        } else {
          triggerToast('Removed from Bookmarks', 'Store was removed from your saved list.');
        }
        localStorage.setItem('bookmarked_stores', JSON.stringify(res.bookmarks));
      } catch (err: any) {
        triggerToast('Bookmark Failed', err?.message || 'Failed to update bookmark.');
      }
    } else {
      try {
        const saved = localStorage.getItem('bookmarked_stores');
        let ids: string[] = saved ? JSON.parse(saved) : [];
        if (ids.includes(storeId)) {
          ids = ids.filter((id) => id !== storeId);
          setIsBookmarked(false);
          triggerToast('Removed from Bookmarks', 'Store was removed from your saved list.');
        } else {
          ids.push(storeId);
          setIsBookmarked(true);
          triggerToast('Store Saved', 'Store was saved to your bookmarked collection.');
        }
        localStorage.setItem('bookmarked_stores', JSON.stringify(ids));
      } catch {}
    }
  };

  const handleReportReview = async (reviewId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await api.ratings.report(reviewId, 'Inappropriate or fake review');
      triggerToast('Report Received', res.message || 'Our moderation team will review this review within 24 hours.');
    } catch (err: any) {
      triggerToast('Report Issue', err?.message || 'Could not submit report.');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Link Copied', 'Store link copied to your clipboard!');
    }
  };

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
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      await api.stores.addPhotos(store.id, res.urls);
      triggerToast('Photos Uploaded', 'Your photos were added to the store gallery.');
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Submit or Update Rating
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!certifyTruthful) {
      setError('Please certify that your review is based on a genuine experience.');
      return;
    }

    setIsSubmittingRating(true);
    setError(null);

    try {
      const userHasRated = store?.userRating !== null && store?.userRating !== undefined;
      const combinedReview = reviewHeadline.trim()
        ? `${reviewHeadline.trim()}: ${reviewBody.trim()}`
        : reviewBody.trim();

      if (userHasRated) {
        await api.ratings.update(storeId, ratingScore, combinedReview);
        triggerToast('Rating Updated', 'Your customer evaluation has been updated.');
      } else {
        await api.ratings.submit(storeId, ratingScore, combinedReview);
        triggerToast('Rating Submitted', 'Thank you! Your verified rating is now published.');
      }

      setIsEditingRating(false);
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Delete User Rating
  const handleDeleteRating = async () => {
    if (!confirm('Are you sure you want to delete your rating and review for this store?')) {
      return;
    }

    setIsDeletingRating(true);
    try {
      await api.ratings.delete(storeId);
      triggerToast('Rating Deleted', 'Your rating was successfully removed.');
      setIsEditingRating(false);
      setReviewBody('');
      setReviewHeadline('');
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete rating');
    } finally {
      setIsDeletingRating(false);
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

  // Rating Distribution breakdown
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

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (filterStar === 'photos') {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    } else if (typeof filterStar === 'number') {
      list = list.filter((r) => Math.round(r.rating) === filterStar);
    }

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
  }, [reviews, sortBy, filterStar]);

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

  const categoryIcon = useMemo(() => {
    const cat = store?.category?.toLowerCase() || '';
    if (cat.includes('electr')) return Laptop;
    if (cat.includes('groc')) return ShoppingBag;
    if (cat.includes('cloth') || cat.includes('fash')) return Shirt;
    if (cat.includes('mall')) return Building2;
    if (cat.includes('cafe') || cat.includes('bake')) return Coffee;
    return StorefrontIcon;
  }, [store?.category]);

  const CategoryIconComponent = categoryIcon;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-28 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider">Loading store details...</p>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
          Store Not Found
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          {error || "The store you are looking for does not exist or could not be loaded."}
        </p>
        <Link
          href="/stores"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono uppercase font-bold border border-zinc-950 dark:border-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store Directory</span>
        </Link>
      </div>
    );
  }

  const userHasRated = store?.userRating !== null && store?.userRating !== undefined;

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* ================= 1. BREADCRUMB TRAIL ================= */}
      <div className="border-b border-zinc-300 dark:border-zinc-800 bg-[#fffde7] dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1">
              <span>Home</span>
            </Link>
            <span className="text-zinc-400">/</span>
            <Link href="/stores" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Stores
            </Link>
            <span className="text-zinc-400">/</span>
            <Link
              href={`/stores?category=${encodeURIComponent(store?.category || 'All')}`}
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              {store?.category || 'General'}
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-950 dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
              {store?.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ================= 2. STORE HERO SECTION ================= */}
      <section className="bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Badges, Title, Address & Meta */}
            <div className="flex-1">
              {/* Category & Verified Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700">
                  <CategoryIconComponent className="w-3.5 h-3.5 text-amber-500" />
                  <span>{store?.category || 'General Retail'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Store</span>
                </span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  {store?.name}
                </h1>
                <CheckCircle className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
              </div>

              {/* Address Line with Map Anchor */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{store?.address}</span>
                <span className="text-zinc-400 mx-1">•</span>
                <a
                  href="#map-section"
                  className="font-mono text-xs uppercase font-bold text-zinc-950 dark:text-white underline hover:no-underline inline-flex items-center gap-1"
                >
                  <span>View on Map</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-zinc-600 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5 text-zinc-950 dark:text-white font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{store?.openingHours || 'Open Now · 9:30 AM – 9:00 PM'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <a href={`tel:${store?.phone || '+919823045678'}`} className="hover:text-zinc-950 dark:hover:text-white">
                    {store?.phone || '+91 98230 45678'}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <a
                    href={store?.website || `https://storerank.platform`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-950 dark:hover:text-white underline"
                  >
                    {store?.website ? store.website.replace(/^https?:\/\//, '') : `storerank.in/${store?.name?.toLowerCase().replace(/\s+/g, '')}`}
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons Cluster */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              {/* Bookmark Button */}
              <button
                type="button"
                onClick={toggleBookmark}
                className={`inline-flex items-center gap-1.5 px-3.5 h-10 border text-xs font-mono uppercase font-bold transition-colors ${
                  isBookmarked
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-950 dark:hover:border-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-amber-400 dark:text-amber-600 fill-current' : 'text-zinc-500'}`} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono uppercase font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Share</span>
              </button>

              {/* Primary CTA: Write / Edit Review */}
              <a
                href="#user-rating-section"
                onClick={() => setIsEditingRating(true)}
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white text-xs font-mono uppercase font-bold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>{userHasRated ? 'Update Rating' : 'Write a Review'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. MAIN BENTO GRID (7:5) ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT COLUMN (7 COLS) ================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. ABOUT STORE CARD */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <StorefrontIcon className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                  About {store?.name}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {store?.description || `${store?.name} is a premier verified destination located at ${store?.address}. Catering to local community members and visitors alike, the store features genuine inventory, dedicated customer service, authentic manufacturer warranties, and direct customer dispute support.`}
              </p>

              {/* 4 Highlights Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Authorized Retailer &amp; Genuine Warranty
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Verified In-Store Physical Presence
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Same-Day Local Customer Assistance
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Direct Feedback &amp; Merchant Resolution
                  </span>
                </div>
              </div>
            </section>

            {/* 2. RATING & REVIEWS OVERVIEW BOX */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                    Rating &amp; Reviews Overview
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Aggregated from verified in-store purchasers
                  </p>
                </div>
                <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono uppercase font-bold">
                  Verified Data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Left Score Box (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-center">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white font-mono leading-none mb-2">
                    {store?.averageRating !== null && store?.averageRating !== undefined
                      ? store.averageRating.toFixed(1)
                      : 'N/A'}
                  </span>
                  <div className="my-1.5">
                    <StarRating rating={store?.averageRating || 0} size="md" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                    Based on {reviews.length} verified ratings
                  </span>
                </div>

                {/* Right Distribution Bars (7 cols) */}
                <div className="sm:col-span-7 flex flex-col gap-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-10 text-right text-zinc-900 dark:text-zinc-100 font-bold flex items-center justify-end gap-1">
                        {item.star} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      </span>
                      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="bg-zinc-950 dark:bg-white h-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Attribute Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Product Authenticity</span>
                  <span className="text-sm font-bold text-zinc-950 dark:text-white font-mono">4.8<span className="text-xs text-zinc-400 font-normal">/5</span></span>
                </div>
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Staff Helpfulness</span>
                  <span className="text-sm font-bold text-zinc-950 dark:text-white font-mono">4.6<span className="text-xs text-zinc-400 font-normal">/5</span></span>
                </div>
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Pricing &amp; Deals</span>
                  <span className="text-sm font-bold text-zinc-950 dark:text-white font-mono">4.4<span className="text-xs text-zinc-400 font-normal">/5</span></span>
                </div>
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">After-Sales Support</span>
                  <span className="text-sm font-bold text-zinc-950 dark:text-white font-mono">4.7<span className="text-xs text-zinc-400 font-normal">/5</span></span>
                </div>
              </div>
            </section>

            {/* 3. USER RATING & REVIEW CARD (DYNAMIC / IN-LINE) */}
            <section
              id="user-rating-section"
              className="bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-white p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-zinc-950 dark:text-white">
                      Your Rating &amp; Review
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {userHasRated ? 'You have submitted a rating for this store' : 'Submit your honest rating and feedback'}
                    </p>
                  </div>
                </div>

                {userHasRated && !isEditingRating && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={store?.userRating || 0} size="sm" />
                    <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white">
                      {store?.userRating?.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* View Existing Rating or Edit Form */}
              {userHasRated && !isEditingRating ? (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 space-y-3">
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
                    "{reviewBody || 'Verified store rating submitted.'}"
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className="text-[11px] text-zinc-500 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Status: Verified &amp; Published
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingRating(true)}
                        className="inline-flex items-center gap-1 text-zinc-950 dark:text-white font-bold hover:underline"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Edit Rating</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteRating}
                        disabled={isDeletingRating}
                        className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* In-line Interactive Rating Form */
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                      Score Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingScore(star)}
                            className={`p-2 border transition-colors ${
                              star <= ratingScore
                                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                                : 'bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${star <= ratingScore ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white ml-2">
                        {ratingScore === 5 && '5.0 - Excellent'}
                        {ratingScore === 4 && '4.0 - Very Good'}
                        {ratingScore === 3 && '3.0 - Average'}
                        {ratingScore === 2 && '2.0 - Poor'}
                        {ratingScore === 1 && '1.0 - Terrible'}
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Headline of your experience
                    </label>
                    <input
                      type="text"
                      value={reviewHeadline}
                      onChange={(e) => setReviewHeadline(e.target.value)}
                      placeholder="e.g. Exceptional customer service and prompt data setup"
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                    />
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Write your honest review
                    </label>
                    <textarea
                      rows={3}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Share details of your own experience at this retailer..."
                      className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
                      <span>Minimum 20 characters recommended</span>
                      <span>{reviewBody.length} characters</span>
                    </div>
                  </div>

                  {/* Certify Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={certifyTruthful}
                        onChange={(e) => setCertifyTruthful(e.target.checked)}
                        className="mt-0.5 w-4 h-4 border border-zinc-300 dark:border-zinc-700 accent-zinc-950"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        I certify that this review is based on my genuine experience and is my honest opinion of this store.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    {userHasRated && (
                      <button
                        type="button"
                        onClick={() => setIsEditingRating(false)}
                        className="px-4 h-9 border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmittingRating}
                      className="px-5 h-9 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white text-xs font-mono uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                      {isSubmittingRating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{userHasRated ? 'Update Rating' : 'Submit Rating'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* 4. COMMUNITY REVIEWS SECTION */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                    Customer Reviews ({reviews.length})
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Real customer ratings sorted by verified credibility
                  </p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white text-xs font-mono"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* Star Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setFilterStar('all')}
                  className={`px-3 py-1 border transition-colors ${
                    filterStar === 'all'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStar(5)}
                  className={`px-3 py-1 border transition-colors ${
                    filterStar === 5
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  5 Star ({reviews.filter((r) => Math.round(r.rating) === 5).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStar(4)}
                  className={`px-3 py-1 border transition-colors ${
                    filterStar === 4
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  4 Star ({reviews.filter((r) => Math.round(r.rating) === 4).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStar('photos')}
                  className={`px-3 py-1 border transition-colors flex items-center gap-1 ${
                    filterStar === 'photos'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  <Camera className="w-3 h-3 text-amber-500" />
                  <span>With Photos</span>
                </button>
              </div>

              {/* Reviews List */}
              {displayedReviews.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No customer reviews match your current filter criteria.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {displayedReviews.map((r) => (
                    <article key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-mono font-bold text-xs border border-zinc-300 dark:border-zinc-700 shrink-0">
                            {r.user?.name ? r.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-mono font-bold text-zinc-950 dark:text-white uppercase">
                                {r.user?.name || 'Verified Shopper'}
                              </h4>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Verified Buyer</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-0.5">
                              <StarRating rating={r.rating} size="sm" />
                              <span className="font-bold text-zinc-950 dark:text-white">{r.rating.toFixed(1)}</span>
                              <span>·</span>
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Report Flag */}
                        <button
                          type="button"
                          onClick={() => handleReportReview(r.id)}
                          title="Report review"
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Review Content */}
                      <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {r.review}
                      </p>

                      {/* Photos Attached to this Review */}
                      {r.photos && r.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {r.photos.map((photoUrl, pIdx) => (
                            <img
                              key={pIdx}
                              src={photoUrl}
                              alt="Customer review attachment"
                              onClick={() => setLightboxImage(photoUrl)}
                              className="w-16 h-16 object-cover border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </div>
                      )}

                      {/* Helpful Button Reaction */}
                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVote(r.id, 'LIKE')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 border transition-colors ${
                            r.userVote === 'LIKE'
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-bold'
                              : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3 text-amber-500" />
                          <span>Helpful ({r.likesCount || 0})</span>
                        </button>
                        <span className="text-[11px] text-zinc-400">Purchased in-store</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ================= RIGHT COLUMN (5 COLS - SIDEBAR META) ================= */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* 1. STORE PHOTOS GALLERY (Bento Grid of 4) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span>Store Photos ({allPhotos.length})</span>
                </h3>

                <label className="cursor-pointer text-xs font-mono uppercase font-bold text-zinc-950 dark:text-white underline hover:no-underline">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadPhotos}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                  <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photos'}</span>
                </label>
              </div>

              {allPhotos.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700">
                  No photos uploaded yet. Be the first customer to upload!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allPhotos.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImage(img)}
                      className="relative aspect-square cursor-pointer overflow-hidden border border-zinc-300 dark:border-zinc-700 group"
                    >
                      <img
                        src={img}
                        alt={`${store?.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-zinc-950/80 text-white text-[9px] font-mono uppercase font-bold">
                        {idx === 0 ? 'Showroom' : idx === 1 ? 'Display' : idx === 2 ? 'Entrance' : `+${allPhotos.length - 3} more`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. HOURS OF OPERATION TABLE */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hours of Operation</span>
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                  Open Today
                </span>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs font-mono">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                  return (
                    <div
                      key={day}
                      className={`py-2 flex items-center justify-between ${
                        isToday ? 'bg-zinc-100 dark:bg-zinc-800 px-2 font-bold text-zinc-950 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span>{day}{isToday ? ' (Today)' : ''}</span>
                      <span>{day === 'Sunday' ? '10:00 AM – 8:30 PM' : '9:30 AM – 9:00 PM'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. LOCATION & DIRECTIONS MAP CARD */}
            <div id="map-section" className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Location &amp; Directions</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {store?.address}
                </p>
              </div>

              {/* Map Preview */}
              <div className="relative h-48 bg-zinc-100 dark:bg-zinc-900">
                {store && store.latitude !== undefined && store.longitude !== undefined ? (
                  <StoreMap
                    stores={[store]}
                    selectedStoreId={store.id}
                    centerCoordinates={[store.longitude, store.latitude]}
                    zoomLevel={15}
                    heightClass="h-48"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-400">
                    GPS Coordinates not provided
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between gap-3 text-xs font-mono">
                <span className="text-zinc-500">Free 2-hour parking available</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store?.name} ${store?.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold border border-zinc-950 dark:border-white transition-colors"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 4. VERIFIED MERCHANT BADGE */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-950 dark:border-white">
                <Shield className="w-5 h-5 text-amber-400 dark:text-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-950 dark:text-white">
                  <span>{store?.name} Partner Account</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Verified Merchant Account on StoreRank platform with direct customer dispute resolution.
                </p>
              </div>
            </div>

            {/* 5. SIMILAR STORES RECOMMENDATIONS */}
            {similarStores.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white font-mono">
                    Similar Stores Nearby
                  </h3>
                  <Link href="/stores" className="text-xs font-mono uppercase font-bold text-zinc-950 dark:text-white underline hover:no-underline">
                    Explore
                  </Link>
                </div>

                <div className="flex flex-col gap-2.5">
                  {similarStores.map((s) => (
                    <Link
                      key={s.id}
                      href={`/stores/${s.id}`}
                      className="group flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-white bg-zinc-50 dark:bg-zinc-950 transition-colors"
                    >
                      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700">
                        {s.photos && s.photos.length > 0 ? (
                          <img src={s.photos[0]} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <StorefrontIcon className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold uppercase text-zinc-950 dark:text-white truncate group-hover:underline">
                            {s.name}
                          </h4>
                          <span className="flex items-center text-xs font-mono font-bold text-zinc-950 dark:text-white">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                            {s.averageRating !== null && s.averageRating !== undefined ? s.averageRating.toFixed(1) : 'NEW'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">{s.address}</p>
                        <span className="text-[10px] font-mono uppercase text-zinc-400">{s.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* ================= 4. LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] object-contain border border-zinc-700"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white font-mono text-xs uppercase flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. FLOATING TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 p-4 border border-zinc-800 dark:border-zinc-200 shadow-none z-50 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
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

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-zinc-400 font-mono text-xs">
          Loading store profile...
        </div>
      }
    >
      <StoreDetailContent params={params} />
    </Suspense>
  );
}
