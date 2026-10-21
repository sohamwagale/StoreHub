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
    <section id="user-rating-section" className="bg-surface border border-border p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            {userHasRated ? 'Your Feedback' : 'Leave a Rating'}
          </span>
          <h2 className="text-base font-extrabold uppercase tracking-tight text-foreground font-mono mt-0.5">
            {userHasRated ? 'Your Submitted Evaluation' : `Rate ${store.name}`}
          </h2>
        </div>
        {userHasRated && !isEditingRating && (
          <button
            type="button"
            onClick={() => setIsEditingRating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted-fill text-foreground text-xs font-mono uppercase font-bold border border-border hover:border-foreground transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-6 bg-muted-fill border border-dashed border-border text-center space-y-3">
          <p className="text-xs text-muted font-mono">
            Sign in to submit your verified 1–5 star evaluation and photo log for this shop.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase font-bold border border-foreground transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in to Rate</span>
          </Link>
        </div>
      ) : userHasRated && !isEditingRating ? (
        <div className="space-y-3 p-4 bg-muted-fill border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={store.userRating || 5} size="md" />
              <span className="font-mono font-bold text-sm text-foreground">
                {(store.userRating || 5).toFixed(1)} / 5.0
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">Your Rating</span>
          </div>

          {reviewBody && (
            <p className="text-xs sm:text-sm text-foreground italic leading-relaxed">
              "{reviewBody}"
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border text-xs font-mono">
            <span className="text-[11px] text-muted uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Status: Verified &amp; Published
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditingRating(true)}
                className="inline-flex items-center gap-1 text-foreground font-bold hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent" />
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
            <label className="block text-xs font-mono uppercase font-bold text-foreground mb-2">
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
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-surface text-muted border-border'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${star <= ratingScore ? 'fill-rating text-rating' : 'fill-border text-border'}`} />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-foreground ml-2">
                {ratingScore === 5 && '5.0 - Excellent'}
                {ratingScore === 4 && '4.0 - Very Good'}
                {ratingScore === 3 && '3.0 - Average'}
                {ratingScore === 2 && '2.0 - Poor'}
                {ratingScore === 1 && '1.0 - Terrible'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
              Headline of your experience
            </label>
            <input
              type="text"
              value={reviewHeadline}
              onChange={(e) => setReviewHeadline(e.target.value)}
              placeholder="e.g. Exceptional customer service and prompt data setup"
              className="w-full h-10 px-3 bg-surface border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-foreground mb-1">
              Write your honest review
            </label>
            <textarea
              rows={3}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Share details of your own experience at this retailer..."
              className="w-full p-3 bg-surface border border-border text-xs sm:text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-muted mt-1">
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
                className="mt-0.5 w-4 h-4 border border-border accent-foreground"
              />
              <span className="text-xs text-muted">
                I certify that this review is based on my genuine experience and is my honest opinion of this store.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            {userHasRated && (
              <button
                type="button"
                onClick={() => setIsEditingRating(false)}
                className="px-4 h-9 border border-border text-xs font-mono uppercase font-bold hover:bg-muted-fill transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmittingRating}
              className="px-5 h-9 bg-foreground text-background border border-foreground text-xs font-mono uppercase font-bold hover:bg-accent-hover transition-colors flex items-center gap-2"
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
  );
}
