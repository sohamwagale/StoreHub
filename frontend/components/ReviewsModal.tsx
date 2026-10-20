'use client';

import React, { useState, useEffect } from 'react';
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

  if (!isOpen || !store) return null;

  const totalPhotos = gallery ? gallery.totalPhotos : (store.photos ? store.photos.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {store.category || 'Store'}
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{store.averageRating !== null ? store.averageRating.toFixed(1) : 'New'}</span>
                <span className="text-zinc-400 font-normal">({store.totalRatings} ratings)</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-1">
              {store.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
              {store.address}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'reviews'
                ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Reviews ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'photos'
                ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Shop Photos ({totalPhotos})</span>
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="m-6 mb-0 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="m-6 mb-0 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs font-medium">Loading store details...</p>
            </div>
          ) : activeTab === 'reviews' ? (
            /* Reviews Tab Content */
            reviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
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
                  className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          {rev.user?.name || 'Verified Customer'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                      <span className="text-xs font-bold text-amber-500">
                        ★ {rev.rating}
                      </span>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>
                  </div>

                  {rev.review ? (
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 pl-10 leading-relaxed">
                      "{rev.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic pl-10">
                      Rated {rev.rating} stars without written comment.
                    </p>
                  )}

                  {/* Attached Review Photos */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="mt-3 pl-10 flex items-center gap-2 overflow-x-auto py-1">
                      {rev.photos.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setLightboxImage(photoUrl)}
                          className="relative group w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-sm"
                        >
                          <img
                            src={photoUrl}
                            alt="Review photo"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            /* Photos & Gallery Tab Content */
            <div className="space-y-6">
              {/* Upload Action Toolbar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">Visited {store.name}?</span>
                  <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
                    Share photos of the store front, interior, or menu!
                  </span>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition active:scale-95">
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
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    No photos added yet
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload the very first photo of {store.name} above!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Store / Owner Photos */}
                  {gallery?.ownerPhotos && gallery.ownerPhotos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                        <span>Official Store Photos</span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                          {gallery.ownerPhotos.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {gallery.ownerPhotos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(url)}
                            className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100"
                          >
                            <img
                              src={url}
                              alt={`Store photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Maximize2 className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Photos */}
                  {gallery?.customerPhotos && gallery.customerPhotos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                        <span>Community & Customer Photos</span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                          {gallery.customerPhotos.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {gallery.customerPhotos.map((cp, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(cp.url)}
                            className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100"
                          >
                            <img
                              src={cp.url}
                              alt="Customer review photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Hover info badge */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 p-2.5 flex flex-col justify-between text-white transition-opacity">
                              <span className="self-end text-xs font-bold bg-amber-500/90 px-1.5 py-0.5 rounded">
                                ★ {cp.rating}
                              </span>
                              <div>
                                <div className="text-[11px] font-bold line-clamp-1">{cp.userName}</div>
                                {cp.review && (
                                  <div className="text-[10px] text-white/80 line-clamp-1 italic">
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
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            Rate {store.name} to help other raters discover great shops
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRateClick(store);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{store.userRating ? 'Update My Rating' : 'Rate & Add Photos'}</span>
            </button>
          </div>
        </div>
      </div>

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
              alt="Full size view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
