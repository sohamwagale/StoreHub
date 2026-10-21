import React from 'react';
import Link from 'next/link';
import { Store, User } from '@/types';
import StarRating from '@/components/StarRating';
import {
  Star,
  CheckCircle2,
  Edit3,
  Trash2,
  Loader2,
  LogIn,
} from 'lucide-react';

interface StoreUserReviewFormProps {
  user: User | null;
  store: Store;
  userHasRated: boolean;
  isEditingRating: boolean;
  setIsEditingRating: (val: boolean) => void;
  ratingScore: number;
  setRatingScore: (val: number) => void;
  reviewHeadline: string;
  setReviewHeadline: (val: string) => void;
  reviewBody: string;
  setReviewBody: (val: string) => void;
  certifyTruthful: boolean;
  setCertifyTruthful: (val: boolean) => void;
  isSubmittingRating: boolean;
  isDeletingRating: boolean;
  onRatingSubmit: (e: React.FormEvent) => void;
  onDeleteRating: () => void;
}

export default function StoreUserReviewForm({
  user,
  store,
  userHasRated,
  isEditingRating,
  setIsEditingRating,
  ratingScore,
  setRatingScore,
  reviewHeadline,
  setReviewHeadline,
  reviewBody,
  setReviewBody,
  certifyTruthful,
  setCertifyTruthful,
  isSubmittingRating,
  isDeletingRating,
  onRatingSubmit,
  onDeleteRating,
}: StoreUserReviewFormProps) {
  return (
    <section id="user-rating-section" className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            {userHasRated ? 'Your Feedback' : 'Leave a Rating'}
          </span>
          <h2 className="text-base font-extrabold uppercase tracking-tight text-zinc-950 dark:text-white font-mono mt-0.5">
            {userHasRated ? 'Your Submitted Evaluation' : `Rate ${store.name}`}
          </h2>
        </div>
        {userHasRated && !isEditingRating && (
          <button
            type="button"
            onClick={() => setIsEditingRating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-mono uppercase font-bold border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-3">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            Sign in to submit your verified 1–5 star evaluation and photo log for this shop.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono uppercase font-bold border border-zinc-950 dark:border-white transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Sign in to Rate</span>
          </Link>
        </div>
      ) : userHasRated && !isEditingRating ? (
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={store.userRating || 5} size="md" />
              <span className="font-mono font-bold text-sm text-zinc-950 dark:text-white">
                {(store.userRating || 5).toFixed(1)} / 5.0
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Your Rating</span>
          </div>

          {reviewBody && (
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
              "{reviewBody}"
            </p>
          )}

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
                onClick={onDeleteRating}
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
        <form onSubmit={onRatingSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              Headline of your experience
            </label>
            <input
              type="text"
              value={reviewHeadline}
              onChange={(e) => setReviewHeadline(e.target.value)}
              placeholder="e.g. Exceptional customer service and prompt data setup"
              className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              Write your honest review
            </label>
            <textarea
              rows={3}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Share details of your own experience at this retailer..."
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none"
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
              <span>Minimum 20 characters recommended</span>
              <span>{reviewBody.length} characters</span>
            </div>
          </div>

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
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 dark:text-amber-600" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                  <span>{userHasRated ? 'Update Rating' : 'Submit Rating'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
