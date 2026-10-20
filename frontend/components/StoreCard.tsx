'use client';

import React from 'react';
import { Store } from '@/types';
import StarRating from './StarRating';
import { MapPin, Star, Edit3, PlusCircle, CheckCircle2 } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  onRate: (store: Store) => void;
  currentUserRole?: 'USER' | 'OWNER' | null;
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
}

export default function StoreCard({
  store,
  onRate,
  currentUserRole,
  isAuthenticated,
  onLoginPrompt,
}: StoreCardProps) {
  const hasRatings = store.averageRating !== null && store.totalRatings > 0;
  const userHasRated = store.userRating !== null && store.userRating !== undefined;

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
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
              store.category?.toLowerCase() === 'grocery'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : store.category?.toLowerCase() === 'malls'
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : store.category?.toLowerCase() === 'clothes'
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                : store.category?.toLowerCase() === 'electronics'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : store.category?.toLowerCase() === 'bakery'
                ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {store.category || 'General'}
          </span>

          {userHasRated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span>You Rated: {store.userRating}★</span>
            </span>
          )}
        </div>

        {/* Store Name */}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
          {store.name}
        </h3>

        {/* Address */}
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-4">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="line-clamp-2">{store.address}</span>
        </div>

        {/* Rating Overview */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 mb-5">
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
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-3">
        {currentUserRole === 'OWNER' ? (
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 italic">
            Owner view only
          </span>
        ) : (
          <button
            onClick={handleActionClick}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
              userHasRated
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm'
            }`}
          >
            {userHasRated ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update My Rating</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isAuthenticated ? 'Rate This Store' : 'Log in to Rate'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
