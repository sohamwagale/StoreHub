import React from 'react';
import { Store, StoreReview } from '@/types';
import StarRating from '@/components/StarRating';
import { Star } from 'lucide-react';

interface RatingDistributionItem {
  star: number;
  count: number;
  percentage: number;
}

interface StoreRatingBreakdownProps {
  store: Store;
  reviews: StoreReview[];
  ratingDistribution: RatingDistributionItem[];
  filterStar: number | 'all' | 'photos';
  onFilterStarChange: (filter: number | 'all' | 'photos') => void;
}

export default function StoreRatingBreakdown({
  store,
  reviews,
  ratingDistribution,
  filterStar,
  onFilterStarChange,
}: StoreRatingBreakdownProps) {
  const avgRating = store.averageRating !== null && store.averageRating !== undefined ? store.averageRating : 0;

  return (
    <section className="bg-surface border border-border p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            Ratings Analysis
          </span>
          <h2 className="text-base font-extrabold uppercase tracking-tight text-foreground font-mono mt-0.5">
            Customer Evaluations Overview
          </h2>
        </div>
        <span className="text-xs font-mono text-muted">
          {reviews.length} total {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score & Stars */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-muted-fill border border-border text-center">
          <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-foreground">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </span>
          <div className="mt-2 mb-1">
            <StarRating rating={avgRating} size="md" />
          </div>
          <span className="text-xs font-mono text-muted uppercase mt-1">
            {avgRating >= 4.5
              ? 'Exceptional Rating'
              : avgRating >= 4.0
              ? 'Highly Recommended'
              : avgRating >= 3.0
              ? 'Average Community Score'
              : avgRating > 0
              ? 'Needs Improvement'
              : 'Awaiting Ratings'}
          </span>
          <span className="text-[11px] font-mono text-muted mt-1">
            Based on {reviews.length} authentic submissions
          </span>
        </div>

        {/* Rating Distribution Bars */}
        <div className="md:col-span-7 space-y-2">
          {ratingDistribution.map((item) => {
            const isActive = filterStar === item.star;
            return (
              <button
                key={item.star}
                type="button"
                onClick={() => onFilterStarChange(isActive ? 'all' : item.star)}
                className={`w-full flex items-center gap-3 text-xs font-mono p-1 transition-colors group ${
                  isActive ? 'bg-muted-fill' : 'hover:bg-muted-fill'
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 font-bold text-muted">
                  <span>{item.star}</span>
                  <Star className="w-3.5 h-3.5 fill-rating text-rating" />
                </div>

                <div className="flex-1 h-2 bg-muted-fill overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="w-16 text-right shrink-0 text-muted text-[11px]">
                  <span>{item.count} ({item.percentage}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
