'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, StoreReview, StoreGallery } from '@/types';
import StarRating from './StarRating';
import { api } from '@/lib/api';
import {
  X,
  Star,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  PlusCircle,
  Camera,
  Upload,
  Maximize2,
  Image as ImageIcon,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from 'lucide-react';

interface ReviewsModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onRateClick: (store: Store) => void;
}

export default function ReviewsModal({
  store,
  isOpen,
  onClose,
  onRateClick,
}: ReviewsModalProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'photos'>('reviews');
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [gallery, setGallery] = useState<StoreGallery | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Add Photo State inside gallery
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadData = async (storeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsData, galleryData] = await Promise.all([
        api.stores.getReviews(storeId),
        api.stores.getGallery(storeId).catch(() => null),
      ]);
      setReviews(reviewsData);
      setGallery(galleryData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (store && isOpen) {
      loadData(store.id);
      setActiveTab('reviews');
      setLightboxImage(null);
      setUploadSuccess(null);
    }
  }, [store, isOpen]);

  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !store) return;

    setIsUploadingPhoto(true);
    setError(null);
    setUploadSuccess(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      await api.stores.addPhotos(store.id, res.urls);
      setUploadSuccess('Photos uploaded successfully to this shop!');
      // Reload gallery
      const updatedGallery = await api.stores.getGallery(store.id);
      setGallery(updatedGallery);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload store photos');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleVote = async (reviewId: string, voteType: 'LIKE' | 'DISLIKE') => {
    if (!store) return;

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
          } else {
            newLikes += 1;
            if (r.userVote === 'DISLIKE') newDislikes = Math.max(0, newDislikes - 1);
            newVote = 'LIKE';
          }
        } else if (voteType === 'DISLIKE') {
          if (r.userVote === 'DISLIKE') {
            newDislikes = Math.max(0, newDislikes - 1);
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
      setError(err?.message || 'Failed to submit vote. You cannot vote on your own review.');
      loadData(store.id);
    }
  };

  if (!isOpen || !store) return null;

  const totalPhotos = gallery ? gallery.totalPhotos : (store.photos ? store.photos.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700">
                {store.category || 'Store'}
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <div className="flex items-center gap-1 text-xs font-bold font-mono text-zinc-950 dark:text-white">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{store.averageRating !== null ? store.averageRating.toFixed(1) : 'New'}</span>
                <span className="text-zinc-400 font-normal">({store.totalRatings} ratings)</span>
              </div>
            </div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white line-clamp-1">
              {store.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {store.address}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              activeTab === 'reviews'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Reviews ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              activeTab === 'photos'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Shop Photos ({totalPhotos})</span>
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="m-5 mb-0 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="m-5 mb-0 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-emerald-500 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500 mb-2" />
              <p className="text-xs font-mono uppercase tracking-wider">Loading store details...</p>
            </div>
          ) : activeTab === 'reviews' ? (
            /* Reviews Tab Content */
            reviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  No reviews yet
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Be the first shopper to share your experience with {store.name}.
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-600">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-950 dark:text-white">
                          {rev.user?.name || 'Verified Customer'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
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

                  {rev.review ? (
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 pl-9 leading-relaxed">
                      "{rev.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic pl-9">
                      Rated {rev.rating} stars without written comment.
                    </p>
                  )}

                  {/* Attached Review Photos */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="mt-3 pl-9 flex items-center gap-2 overflow-x-auto py-1">
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
                  <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 pl-9">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Helpful review?</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(rev.id, 'LIKE')}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border transition-colors ${
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
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border transition-colors ${
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
              ))
            )
          ) : (
            /* Photos & Gallery Tab Content */
            <div className="space-y-5">
              {/* Upload Action Toolbar */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Visited {store.name}?</span>
                  <span className="hidden sm:inline text-zinc-500">
                    Share photos of store front or interior.
                  </span>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors">
                  {isUploadingPhoto ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
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
              </div>

              {/* All Photos Grid */}
              {totalPhotos === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    No photos added yet
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload the first photo of {store.name} above!
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Store / Owner Photos */}
                  {gallery?.ownerPhotos && gallery.ownerPhotos.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span>Official Store Photos</span>
                        <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-[10px]">
                          {gallery.ownerPhotos.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {gallery.ownerPhotos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(url)}
                            className="relative group aspect-square overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
                          >
                            <img
                              src={url}
                              alt={`Store photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Photos */}
                  {gallery?.customerPhotos && gallery.customerPhotos.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span>Customer Photos</span>
                        <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-[10px]">
                          {gallery.customerPhotos.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {gallery.customerPhotos.map((cp, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(cp.url)}
                            className="relative group aspect-square overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
                          >
                            <img
                              src={cp.url}
                              alt="Customer review photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {/* Info overlay */}
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 p-2.5 flex flex-col justify-between text-white transition-opacity">
                              <span className="self-end text-[10px] font-mono font-bold bg-zinc-950 px-1.5 py-0.5 border border-amber-500/80 text-amber-400">
                                ★ {cp.rating}
                              </span>
                              <div>
                                <div className="text-[11px] font-bold line-clamp-1">{cp.userName}</div>
                                {cp.review && (
                                  <div className="text-[10px] text-zinc-300 line-clamp-1 italic">
                                    "{cp.review}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Rate {store.name} to help shoppers discover quality local stores
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRateClick(store);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{store.userRating ? 'Update Rating' : 'Rate & Add Photos'}</span>
            </button>
          </div>
        </div>
      </div>

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
              alt="Full size view"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
