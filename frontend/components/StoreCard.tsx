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
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors flex flex-col justify-between">
      {/* Photo Cover or Category Pattern */}
      <Link
        href={`/stores/${store.id}`}
        className="block relative w-full h-44 bg-zinc-900 overflow-hidden cursor-pointer"
      >
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
            <Camera className="w-7 h-7 opacity-40 mb-1" />
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">No photos yet</span>
          </div>
        )}

        {/* Category Tag Over Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-zinc-950 text-white border border-white/20">
            {store.category || 'General'}
          </span>

          {hasPhotos && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-950/90 text-white border border-white/20">
              <Camera className="w-3 h-3 text-amber-400" />
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
            className="absolute top-2.5 right-2.5 p-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-white/20 transition-colors z-10"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User Rated Badge over photo bottom */}
        {userHasRated && (
          <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-zinc-950 text-amber-400 border border-amber-400/40">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            <span>Rated {store.userRating}★</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Store Name linking to dedicated store page */}
          <Link href={`/stores/${store.id}`} className="block group/link">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white group-hover/link:underline transition-all line-clamp-1 mb-1 flex items-center gap-1.5">
              <span className="truncate">{store.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </h3>
          </Link>

          {/* Address & Coordinates */}
          <div className="space-y-0.5 mb-3">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="line-clamp-1">{store.address}</span>
            </div>
            {store.latitude !== undefined && store.longitude !== undefined && (
              <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 pl-5">
                GPS: {store.latitude.toFixed(4)}°, {store.longitude.toFixed(4)}°
              </div>
            )}
          </div>

          {/* Rating Overview Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 mb-3">
            {hasRatings ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
                      {store.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">/ 5</span>
                  </div>
                  <StarRating rating={store.averageRating} size="sm" />
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-mono">No ratings yet</span>
                </div>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 uppercase">
                  First to rate
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          {onViewReviews && (
            <button
              type="button"
              onClick={() => onViewReviews(store)}
              className="flex-1 py-1.5 px-2 text-xs font-medium uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
              title="Read customer reviews & photos"
            >
              <MessageSquare className="w-3 h-3 text-zinc-500" />
              <span>Reviews ({store.totalRatings})</span>
            </button>
          )}

          {currentUserRole === 'OWNER' ? (
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 py-1.5 text-center flex-1">
              Owner view
            </span>
          ) : (
            <button
              onClick={handleActionClick}
              className={`flex-1 py-1.5 px-2 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                userHasRated
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50'
                  : 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
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
