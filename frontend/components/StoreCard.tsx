'use client';

import React from 'react';
import Link from 'next/link';
import { Store } from '@/types';
import StarRating from './StarRating';
import {
  MapPin,
  Edit3,
  PlusCircle,
  CheckCircle2,
  MessageSquare,
  Camera,
  Navigation,
} from 'lucide-react';

interface StoreCardProps {
  store: Store;
  onRate: (store: Store) => void;
  onViewReviews?: (store: Store) => void;
  onLocateOnMap?: (store: Store) => void;
  currentUserRole?: 'USER' | 'OWNER' | null;
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
}

export default function StoreCard({
  store,
  onRate,
  onViewReviews,
  onLocateOnMap,
  currentUserRole,
  isAuthenticated,
  onLoginPrompt,
}: StoreCardProps) {
  const hasRatings = store.averageRating !== null && store.totalRatings > 0;
  const userHasRated = store.userRating !== null && store.userRating !== undefined;
  const hasPhotos = store.photos && store.photos.length > 0;
  const coverPhoto = hasPhotos ? store.photos![0] : null;

  const handleActionClick = () => {
    if (!isAuthenticated) {
      onLoginPrompt();
      return;
    }
    if (currentUserRole === 'USER') {
      onRate(store);
    }
  };

  return (
    <div className="group relative bg-surface border border-border hover:border-foreground transition-colors flex flex-col justify-between">
      {/* Clean Photo Cover */}
      <Link
        href={`/stores/${store.id}`}
        className="block relative w-full h-44 bg-muted-fill overflow-hidden cursor-pointer border-b border-border"
      >
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted-fill text-muted">
            <Camera className="w-6 h-6 opacity-40 mb-1" />
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">No photos yet</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-muted-fill text-muted border border-border">
              {store.category || 'General'}
            </span>

            <div className="flex items-center gap-2">
              {userHasRated && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                  <span>Rated {store.userRating}★</span>
                </span>
              )}
              {onLocateOnMap && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLocateOnMap(store);
                  }}
                  title="Locate store on Map"
                  className="p-1 text-muted hover:text-foreground transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Store Name */}
          <Link href={`/stores/${store.id}`} className="block group/link mb-1">
            <h3 className="text-base font-bold text-foreground group-hover/link:underline transition-all line-clamp-1">
              {store.name}
            </h3>
          </Link>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-muted text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="line-clamp-1">{store.address}</span>
          </div>

          {/* Rating Row (Clean & Integrated) */}
          <div className="flex items-center justify-between text-xs font-mono py-2 border-t border-border mb-3">
            <div className="flex items-center gap-1.5">
              <StarRating rating={store.averageRating || 0} size="sm" />
              <span className="font-bold text-foreground ml-0.5">
                {hasRatings ? store.averageRating?.toFixed(1) : 'New'}
              </span>
            </div>
            <span className="text-[11px] text-muted">
              {hasRatings ? `${store.totalRatings} ${store.totalRatings === 1 ? 'review' : 'reviews'}` : 'Be first to rate'}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-border flex items-center gap-2">
          {onViewReviews && (
            <button
              type="button"
              onClick={() => onViewReviews(store)}
              className="flex-1 h-9 px-2 text-xs font-mono uppercase font-semibold bg-muted-fill hover:bg-muted-fill text-foreground border border-border flex items-center justify-center gap-1.5 transition-colors"
              title="Read customer reviews"
            >
              <MessageSquare className="w-3 h-3 text-muted" />
              <span>Reviews ({store.totalRatings})</span>
            </button>
          )}

          {currentUserRole === 'OWNER' ? (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted dark:text-muted h-9 flex items-center justify-center text-center flex-1">
              Owner view
            </span>
          ) : (
            <button
              onClick={handleActionClick}
              className={`flex-1 h-9 px-2 text-xs font-mono uppercase font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                userHasRated
                  ? 'border-amber-500/80 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
              }`}
            >
              {userHasRated ? (
                <>
                  <Edit3 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Update</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3 h-3 text-amber-400 dark:text-amber-600" />
                  <span>{isAuthenticated ? 'Rate' : 'Log in'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
