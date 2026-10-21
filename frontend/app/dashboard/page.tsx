'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MyRating, Store } from '@/types';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import RatingModal from '@/components/RatingModal';
import {
  User as UserIcon,
  MapPin,
  Star,
  Edit2,
  Calendar,
  Store as StoreIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function UserDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [myRatings, setMyRatings] = useState<MyRating[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchMyRatings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.ratings.getMyRatings();
      setMyRatings(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your submitted ratings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchMyRatings();
      }
    }
  }, [user, isAuthLoading, router, fetchMyRatings]);

  if (isAuthLoading || (!user && !error)) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleOpenEdit = (ratingItem: MyRating) => {
    if (!ratingItem.store) return;
    const storeObj: Store = {
      id: ratingItem.store.id,
      _id: ratingItem.store.id,
      name: ratingItem.store.name,
      address: ratingItem.store.address,
      ownerId: '',
      averageRating: null,
      totalRatings: 0,
      userRating: ratingItem.rating,
    };
    setSelectedStore(storeObj);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Dashboard Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Shopper Feedback Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
            My Submitted Ratings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Review and update your ratings and reviews for visited stores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Profile</span>
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
          >
            <span>Rate More</span>
            <ExternalLink className="w-3 h-3 text-amber-400 dark:text-amber-600" />
          </Link>
        </div>
      </div>

      {/* Submitted Ratings Section */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Submitted Ratings
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
              {myRatings.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : myRatings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
            <div className="w-10 h-10 mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              You haven't rated any stores yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Browse registered stores and share your ratings to help other shoppers.
            </p>
            <Link
              href="/stores"
              className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myRatings.map((item) => {
              const storeId = item.store?.id;
              const coverPhoto = item.store?.photos && item.store.photos.length > 0 ? item.store.photos[0] : null;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Store Cover Image */}
                    {storeId ? (
                      <Link
                        href={`/stores/${storeId}`}
                        className="block relative w-full h-36 bg-zinc-900 overflow-hidden cursor-pointer group"
                      >
                        {coverPhoto ? (
                          <img
                            src={coverPhoto}
                            alt={item.store?.name || 'Store'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                            <StoreIcon className="w-7 h-7 opacity-40 mb-1" />
                            <span className="text-[10px] font-mono uppercase opacity-60">Verified Store</span>
                          </div>
                        )}
                        {item.store?.category && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-zinc-950 text-white uppercase tracking-wider border border-white/20">
                            {item.store.category}
                          </span>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-950 text-amber-400 border border-amber-400/40 flex items-center gap-1">
                          <span>You: {item.rating}★</span>
                        </span>
                      </Link>
                    ) : (
                      <div className="relative w-full h-24 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                        <StoreIcon className="w-6 h-6 opacity-40" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="mb-1">
                        {storeId ? (
                          <Link
                            href={`/stores/${storeId}`}
                            className="text-base font-bold text-zinc-950 dark:text-white hover:underline transition line-clamp-1"
                          >
                            {item.store?.name || 'Store'}
                          </Link>
                        ) : (
                          <h3 className="text-base font-bold text-zinc-950 dark:text-white line-clamp-1">
                            {item.store?.name || 'Store'}
                          </h3>
                        )}
                      </div>

                      <div className="flex items-start gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.store?.address}</span>
                      </div>

                      {item.review && (
                        <div className="p-2.5 mb-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 italic line-clamp-2">
                          "{item.review}"
                        </div>
                      )}

                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <StarRating rating={item.rating} size="sm" />
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="w-full py-1.5 px-3 text-xs font-mono uppercase font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Update Rating</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <RatingModal
        store={selectedStore}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMyRatings}
      />
    </div>
  );
}
