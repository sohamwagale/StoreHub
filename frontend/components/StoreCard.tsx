'use client';

import React from 'react';
import Link from 'next/link';
import { Store } from '@/types';
import StarRating from './StarRating';
import {
  MapPin,
  Star,
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
      {/* Photo Cover or Category Pattern */}
      <Link
        href={`/stores/${store.id}`}
        className="block relative w-full h-44 bg-black overflow-hidden cursor-pointer"
      >
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black text-muted">
            <Camera className="w-7 h-7 opacity-40 mb-1" />
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">No photos yet</span>
          </div>
        )}

        {/* Category Tag Over Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-black/90 text-white border border-white/20">
            {store.category || 'General'}
          </span>
          {hasPhotos && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/90 text-white border border-white/20">
              <Camera className="w-3 h-3 text-accent" />
              <span>{store.photos!.length}</span>
            </span>
          )}
        </div>

        {/* Locate on Map Button over photo */}
        {onLocateOnMap && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocateOnMap(store);
            }}
            title="Locate store on Map"
            className="absolute top-2.5 right-2.5 p-1.5 bg-black/90 text-white hover:bg-black border border-white/20 transition-colors z-10"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User Rated Badge over photo bottom */}
        {userHasRated && (
          <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-black text-rating border border-rating/40">
            <CheckCircle2 className="w-3 h-3 text-accent" />
            <span>Rated {store.userRating}★</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Store Name */}
          <Link href={`/stores/${store.id}`} className="block group/link mb-1">
            <h3 className="text-base font-bold text-foreground group-hover/link:underline transition-all line-clamp-1 flex items-center gap-1.5">
              <span className="truncate">{store.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
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
              className="flex-1 py-1.5 px-2 text-xs font-mono uppercase font-semibold bg-muted-fill hover:bg-muted-fill text-foreground border border-border flex items-center justify-center gap-1.5 transition-colors"
              title="Read customer reviews"
            >
              <MessageSquare className="w-3 h-3 text-muted" />
              <span>Reviews ({store.totalRatings})</span>
            </button>
          )}

          {currentUserRole === 'OWNER' ? (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted dark:text-muted py-1.5 text-center flex-1">
              Owner view
            </span>
          ) : (
            <button
              onClick={handleActionClick}
              className={`flex-1 py-1.5 px-2 text-xs font-mono uppercase font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                userHasRated
                  ? 'border-rating text-rating bg-muted-fill hover:bg-muted-fill'
                  : 'border-foreground bg-foreground text-background hover:bg-accent-hover'
              }`}
            >
              {userHasRated ? (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Update</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3 h-3" />
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
