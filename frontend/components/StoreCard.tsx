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
  ExternalLink,
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
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between">
      {/* Photo Cover or Category Pattern */}
      <Link
        href={`/stores/${store.id}`}
        className="block relative w-full h-40 bg-gradient-to-tr from-zinc-800 to-zinc-900 overflow-hidden cursor-pointer"
      >
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-zinc-900 text-zinc-400">
            <Camera className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[11px] font-medium opacity-60">No photos yet</span>
          </div>
        )}

        {/* Category Pill Over Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-md ${
              store.category?.toLowerCase() === 'grocery'
                ? 'bg-emerald-600/90 text-white'
                : store.category?.toLowerCase() === 'malls'
                ? 'bg-indigo-600/90 text-white'
                : store.category?.toLowerCase() === 'clothes'
                ? 'bg-pink-600/90 text-white'
                : store.category?.toLowerCase() === 'electronics'
                ? 'bg-sky-600/90 text-white'
                : store.category?.toLowerCase() === 'bakery'
                ? 'bg-amber-600/90 text-white'
                : 'bg-zinc-800/90 text-white'
            }`}
          >
            {store.category || 'General'}
          </span>

          {hasPhotos && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md shadow-sm">
              <Camera className="w-3 h-3 text-amber-300" />
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
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 hover:bg-white text-zinc-700 dark:text-zinc-200 hover:text-amber-600 shadow-md backdrop-blur-md transition-all active:scale-95 z-10"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User Rated Badge over photo bottom */}
        {userHasRated && (
          <div className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>You Rated: {store.userRating}★</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Store Name linking to dedicated store page */}
          <Link href={`/stores/${store.id}`} className="block group/link">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover/link:text-amber-600 dark:group-hover/link:text-amber-400 transition-colors line-clamp-1 mb-1">
              {store.name}
            </h3>
          </Link>

          {/* Address & Coordinates */}
          <div className="space-y-1 mb-4">
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
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 mb-4">
            {hasRatings ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                      {store.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">/ 5</span>
                  </div>
                  <StarRating rating={store.averageRating} size="sm" />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                  <span className="text-xs font-medium italic">No ratings yet</span>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Be the first to rate!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2">
          <Link
            href={`/stores/${store.id}`}
            className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1 transition"
            title="Open shop page with details and reviews"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>

          {onViewReviews && (
            <button
              type="button"
              onClick={() => onViewReviews(store)}
              className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              title="Read customer reviews & photos"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reviews ({store.totalRatings})</span>
            </button>
          )}

          {currentUserRole === 'OWNER' ? (
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 italic py-2">
              Owner view
            </span>
          ) : (
            <button
              onClick={handleActionClick}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all transform active:scale-95 ${
                userHasRated
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                  : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm'
              }`}
            >
              {userHasRated ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
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
