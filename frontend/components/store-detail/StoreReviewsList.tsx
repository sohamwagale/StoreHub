import React from 'react';
import { StoreReview } from '@/types';
import StarRating from '@/components/StarRating';
import {
  Camera,
  CheckCircle2,
  Flag,
  ThumbsUp,
} from 'lucide-react';

interface StoreReviewsListProps {
  reviews: StoreReview[];
  displayedReviews: StoreReview[];
  sortBy: 'newest' | 'highest' | 'lowest' | 'helpful';
  onSortByChange: (val: 'newest' | 'highest' | 'lowest' | 'helpful') => void;
  filterStar: number | 'all' | 'photos';
  onFilterStarChange: (val: number | 'all' | 'photos') => void;
  onVote: (reviewId: string, type: 'LIKE' | 'DISLIKE') => void;
  onReport: (reviewId: string) => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export default function StoreReviewsList({
  reviews,
  displayedReviews,
  sortBy,
  onSortByChange,
  filterStar,
  onFilterStarChange,
  onVote,
  onReport,
  onOpenLightbox,
}: StoreReviewsListProps) {
  return (
    <section className="bg-surface border border-border p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground font-mono">
            Customer Reviews ({reviews.length})
          </h2>
          <p className="text-xs text-muted">
            Real customer ratings sorted by verified credibility
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => onSortByChange(e.target.value)}
            className="px-2.5 py-1.5 border border-border bg-surface text-foreground focus:outline-none focus:border-accent text-xs font-mono"
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
          onClick={() => onFilterStarChange('all')}
          className={`px-3 py-1 border transition-colors ${
            filterStar === 'all'
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border bg-muted-fill text-muted hover:border-foreground'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => onFilterStarChange(5)}
          className={`px-3 py-1 border transition-colors ${
            filterStar === 5
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border bg-muted-fill text-muted hover:border-foreground'
          }`}
        >
          5 Star ({reviews.filter((r) => Math.round(r.rating) === 5).length})
        </button>
        <button
          type="button"
          onClick={() => onFilterStarChange(4)}
          className={`px-3 py-1 border transition-colors ${
            filterStar === 4
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border bg-muted-fill text-muted hover:border-foreground'
          }`}
        >
          4 Star ({reviews.filter((r) => Math.round(r.rating) === 4).length})
        </button>
        <button
          type="button"
          onClick={() => onFilterStarChange('photos')}
          className={`px-3 py-1 border transition-colors flex items-center gap-1 ${
            filterStar === 'photos'
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border bg-muted-fill text-muted hover:border-foreground'
          }`}
        >
          <Camera className="w-3 h-3 text-accent" />
          <span>With Photos</span>
        </button>
      </div>

      {/* Reviews List */}
      {displayedReviews.length === 0 ? (
        <div className="py-12 text-center text-muted font-mono text-xs">
          No customer reviews match your current filter criteria.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayedReviews.map((r) => (
            <article key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted-fill text-foreground flex items-center justify-center font-mono font-bold text-xs border border-border shrink-0">
                    {r.user?.name ? r.user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-mono font-bold text-foreground uppercase">
                        {r.user?.name || 'Verified Shopper'}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted mt-0.5">
                      <StarRating rating={r.rating} size="sm" />
                      <span className="font-bold text-foreground">{r.rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Report Flag */}
                <button
                  type="button"
                  onClick={() => onReport(r.id)}
                  title="Report review"
                  className="text-muted hover:text-red-500 transition-colors p-1"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Review Content */}
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
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
                      onClick={() => onOpenLightbox(photoUrl)}
                      className="w-16 h-16 object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button Reaction */}
              <div className="flex items-center gap-4 text-xs font-mono text-muted pt-1">
                <button
                  type="button"
                  onClick={() => onVote(r.id, 'LIKE')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 border transition-colors ${
                    r.userVote === 'LIKE'
                      ? 'bg-foreground text-background border-foreground font-bold'
                      : 'bg-muted-fill text-muted border-border hover:border-foreground'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 text-accent" />
                  <span>Helpful ({r.likesCount || 0})</span>
                </button>
                <span className="text-[11px] text-muted">Purchased in-store</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
