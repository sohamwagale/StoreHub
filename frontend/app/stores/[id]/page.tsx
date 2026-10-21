'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, StoreReview, StoreGallery } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StoreDetailSkeleton } from '@/components/Skeleton';
import StoreHero from '@/components/store-detail/StoreHero';
import StoreAboutCard from '@/components/store-detail/StoreAboutCard';
import StoreRatingBreakdown from '@/components/store-detail/StoreRatingBreakdown';
import StoreUserReviewForm from '@/components/store-detail/StoreUserReviewForm';
import StoreReviewsList from '@/components/store-detail/StoreReviewsList';
import StorePhotoGallery from '@/components/store-detail/StorePhotoGallery';
import StoreSidebarInfo from '@/components/store-detail/StoreSidebarInfo';
import StoreLightbox from '@/components/store-detail/StoreLightbox';
import {
  AlertCircle,
  CheckCircle2,
  X,
  Store as StorefrontIcon,
  Laptop,
  ShoppingBag,
  Building2,
  Shirt,
  Coffee,
} from 'lucide-react';

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

      const similar = (allStores || [])
        .filter((s) => s.id !== storeId && s.category === storeData.category)
        .slice(0, 2);
      setSimilarStores(similar.length > 0 ? similar : (allStores || []).filter((s) => s.id !== storeId).slice(0, 2));

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

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to remove this store image?')) return;
    try {
      await api.stores.deletePhoto(storeId, photoUrl);
      triggerToast('Photo Deleted', 'The store photo was successfully removed.');
      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          photos: (prev.photos || []).filter((p) => p !== photoUrl),
        };
      });
      if (gallery) {
        setGallery((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            customerPhotos: (prev.customerPhotos || []).filter((p) => p.url !== photoUrl),
          };
        });
      }
    } catch (err: any) {
      triggerToast('Delete Failed', err?.message || 'Failed to delete photo.');
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmittingRating(true);
    setError(null);

    try {
      const combinedReview = reviewHeadline.trim()
        ? `${reviewHeadline.trim()}\n\n${reviewBody.trim()}`
        : reviewBody.trim();

      if (store?.userRating !== null && store?.userRating !== undefined) {
        await api.ratings.update(storeId, ratingScore, combinedReview);
        triggerToast('Rating Updated', 'Your score and review were updated successfully.');
      } else {
        await api.ratings.submit(storeId, ratingScore, combinedReview);
        triggerToast('Rating Submitted', 'Thank you! Your feedback helps shoppers find great stores.');
      }

      setIsEditingRating(false);
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!confirm('Are you sure you want to remove your rating and review for this store?')) {
      return;
    }

    setIsDeletingRating(true);
    setError(null);
    try {
      await api.ratings.delete(storeId);
      triggerToast('Rating Deleted', 'Your evaluation was successfully removed.');
      setRatingScore(5);
      setReviewHeadline('');
      setReviewBody('');
      setIsEditingRating(false);
      await loadStoreDetails();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove rating.');
    } finally {
      setIsDeletingRating(false);
    }
  };

  const handleVote = async (reviewId: string, voteType: 'LIKE' | 'DISLIKE') => {
    if (!user) {
      router.push('/login');
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const currentVote = r.userVote;
        let likesCount = r.likesCount || 0;
        let dislikesCount = r.dislikesCount || 0;
        let newVote: 'LIKE' | 'DISLIKE' | null = null;

        if (voteType === 'LIKE') {
          if (currentVote === 'LIKE') {
            likesCount = Math.max(0, likesCount - 1);
            newVote = null;
          } else {
            likesCount += 1;
            if (currentVote === 'DISLIKE') dislikesCount = Math.max(0, dislikesCount - 1);
            newVote = 'LIKE';
          }
        }
        return { ...r, likesCount, dislikesCount, userVote: newVote };
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

  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const score = Math.round(r.rating);
      if (counts[score] !== undefined) counts[score] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percentage: Math.round((counts[star] / total) * 100),
    }));
  }, [reviews]);

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

  if (isLoading) {
    return <StoreDetailSkeleton />;
  }

  if (error && !store) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
          Store Not Found
        </h2>
        <p className="text-xs text-muted mt-1 max-w-sm">
          {error || 'The store you are looking for does not exist or could not be loaded.'}
        </p>
        <Link
          href="/stores"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase font-bold border border-foreground transition-colors"
        >
          Return to Stores
        </Link>
      </div>
    );
  }

  const userHasRated = store?.userRating !== null && store?.userRating !== undefined;

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Breadcrumb Trail */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-2 text-xs font-mono uppercase text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted">/</span>
            <Link href="/stores" className="hover:text-foreground transition-colors">
              Stores
            </Link>
            <span className="text-muted">/</span>
            <Link
              href={`/stores?category=${encodeURIComponent(store?.category || 'All')}`}
              className="hover:text-foreground transition-colors"
            >
              {store?.category || 'General'}
            </Link>
            <span className="text-muted">/</span>
            <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-none">
              {store?.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Store Hero */}
      {store && (
        <StoreHero
          store={store}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onShare={handleShare}
          onWriteReviewClick={() => setIsEditingRating(true)}
          CategoryIcon={categoryIcon}
          userHasRated={userHasRated}
        />
      )}

      {/* Bento Grid (7 cols / 5 cols) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {store && <StoreAboutCard store={store} />}

            {store && (
              <StoreRatingBreakdown
                store={store}
                reviews={reviews}
                ratingDistribution={ratingDistribution}
                filterStar={filterStar}
                onFilterStarChange={setFilterStar}
              />
            )}

            {store && (
              <StoreUserReviewForm
                user={user}
                store={store}
                userHasRated={userHasRated}
                isEditingRating={isEditingRating}
                setIsEditingRating={setIsEditingRating}
                ratingScore={ratingScore}
                setRatingScore={setRatingScore}
                reviewHeadline={reviewHeadline}
                setReviewHeadline={setReviewHeadline}
                reviewBody={reviewBody}
                setReviewBody={setReviewBody}
                certifyTruthful={certifyTruthful}
                setCertifyTruthful={setCertifyTruthful}
                isSubmittingRating={isSubmittingRating}
                isDeletingRating={isDeletingRating}
                onRatingSubmit={handleRatingSubmit}
                onDeleteRating={handleDeleteRating}
              />
            )}

            <StoreReviewsList
              reviews={reviews}
              displayedReviews={displayedReviews}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              filterStar={filterStar}
              onFilterStarChange={setFilterStar}
              onVote={handleVote}
              onReport={handleReportReview}
              onOpenLightbox={setLightboxImage}
            />
          </div>

          {/* Right Column (5 cols) */}
          {store && (
            <div className="lg:col-span-5 flex flex-col gap-6">
              <StorePhotoGallery
                store={store}
                allPhotos={allPhotos}
                isUploadingPhoto={isUploadingPhoto}
                onUploadPhotos={handleUploadPhotos}
                onOpenLightbox={setLightboxImage}
                isOwner={user?.role === 'OWNER' && user?.id === store.ownerId}
                onDeletePhoto={handleDeletePhoto}
              />

              <StoreSidebarInfo
                store={store}
                similarStores={similarStores}
              />
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <StoreLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-foreground text-background p-4 border border-foreground z-50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-mono uppercase font-bold tracking-wider">{toastMessage.title}</h5>
            <p className="text-xs text-background/70 mt-0.5">{toastMessage.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-muted hover:text-background"
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
    <Suspense fallback={<StoreDetailSkeleton />}>
      <StoreDetailContent params={params} />
    </Suspense>
  );
}
