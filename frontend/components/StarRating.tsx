'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  disabled?: boolean;
}

export default function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
  showValue = false,
  disabled = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const effectiveRating = hoverRating !== null ? hoverRating : rating || 0;

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= effectiveRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive || disabled}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && !disabled && setHoverRating(starValue)}
              onMouseLeave={() => interactive && !disabled && setHoverRating(null)}
              className={`p-0.5 transition-transform ${
                interactive && !disabled
                  ? 'hover:scale-125 cursor-pointer focus:outline-none'
                  : 'cursor-default'
              }`}
              title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-500 text-amber-500'
                    : 'fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
          {rating !== null && rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
        </span>
      )}
    </div>
  );
}
