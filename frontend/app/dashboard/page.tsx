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
  Mail,
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dashboard Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-semibold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Shopper Feedback Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            My Submitted Ratings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review and update your 1–5 star ratings for stores you have visited
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>My Profile</span>
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Rate More Stores</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Submitted Ratings Section */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              My Submitted Ratings
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {myRatings.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : myRatings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              You haven't rated any stores yet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
              Browse registered stores and share your ratings to help other shoppers.
            </p>
            <Link
              href="/stores"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl shadow-md shadow-orange-500/20"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRatings.map((item) => {
              const storeId = item.store?.id;
              const coverPhoto = item.store?.photos && item.store.photos.length > 0 ? item.store.photos[0] : null;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Store Cover Image linking to dedicated page */}
                    {storeId ? (
                      <Link
                        href={`/stores/${storeId}`}
                        className="block relative w-full h-36 bg-zinc-800 overflow-hidden cursor-pointer group"
                      >
                        {coverPhoto ? (
                          <img
                            src={coverPhoto}
                            alt={item.store?.name || 'Store'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-zinc-900 text-zinc-400">
                            <StoreIcon className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[11px] font-medium opacity-60">Verified Store</span>
                          </div>
                        )}
                        {item.store?.category && (
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
                            {item.store.category}
                          </span>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                          <span>You: {item.rating}★</span>
                        </span>
                      </Link>
                    ) : (
                      <div className="relative w-full h-24 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <StoreIcon className="w-6 h-6 opacity-40" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        {storeId ? (
                          <Link
                            href={`/stores/${storeId}`}
                            className="text-base font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition hover:underline line-clamp-1"
                          >
                            {item.store?.name || 'Store'}
                          </Link>
                        ) : (
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {item.store?.name || 'Store'}
                          </h3>
                        )}
                      </div>

                      <div className="flex items-start gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.store?.address}</span>
                      </div>

                      {item.review && (
                        <div className="p-3 mb-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 italic line-clamp-2">
                          "{item.review}"
                        </div>
                      )}

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <StarRating rating={item.rating} size="sm" />
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
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
