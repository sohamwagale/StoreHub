'use client';

import React, { useState, useEffect } from 'react';
import { Store, StoreReview } from '@/types';
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
  CheckCircle2,
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
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store && isOpen) {
      setIsLoading(true);
      setError(null);
      api.stores
        .getReviews(store.id)
        .then((data) => setReviews(data))
        .catch((err) => setError(err?.message || 'Failed to load store reviews'))
        .finally(() => setIsLoading(false));
    }
  }, [store, isOpen]);

  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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
                <span>{store.averageRating !== null ? store.averageRating.toFixed(1) : 'No ratings'}</span>
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

        {/* Reviews Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs">Loading customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
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
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            Have you visited this store?
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
              <span>{store.userRating ? 'Update My Review' : 'Write a Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
