'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OwnerStoreData } from '@/types';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import {
  Shield,
  Store as StoreIcon,
  Users,
  Star,
  MapPin,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCw,
  Camera,
  Upload,
  CheckCircle,
  Navigation,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState<OwnerStoreData[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.owner.getDashboard();
      setStores(data.stores || []);
    } catch (err: any) {
      if (err?.statusCode === 403) {
        setError('Access denied. Restricted to Store Owners only.');
      } else {
        setError(err?.message || 'Failed to load owner dashboard data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUploadOwnerPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const activeStore = stores[selectedStoreIndex];
    if (!files || files.length === 0 || !activeStore) return;

    setIsUploadingPhoto(true);
    setError(null);
    setPhotoSuccessMsg(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      await api.stores.addPhotos(activeStore.id, res.urls);
      setPhotoSuccessMsg('Store photos uploaded successfully!');
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photos');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'OWNER') {
        setError('Access Denied. You are logged in as a normal USER. Only STORE OWNERS can access this page.');
        setIsLoading(false);
      } else {
        fetchDashboard();
      }
    }
  }, [user, isAuthLoading, router, fetchDashboard]);

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Unauthorized screen for normal users
  if (user && user.role !== 'OWNER') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 border border-zinc-300 dark:border-zinc-700 text-center">
          <div className="w-12 h-12 mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
            Owner Access Restricted
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            Your current account has the USER role. Only registered OWNER accounts can access the store management dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white transition-colors"
            >
              Go to Shopper Dashboard
            </Link>
            <Link
              href="/stores"
              className="py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 transition-colors"
            >
              Back to Stores Listing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeStore = stores[selectedStoreIndex] || null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>Owner Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
            Store Performance & Customer Ratings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time ratings, reviews, and photo gallery management for your registered locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <span>+ Add Store</span>
          </Link>

          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {photoSuccessMsg && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-emerald-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <p>{photoSuccessMsg}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              No store registered yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              Complete your store profile onboarding to set your coordinates, address, and photos so customers can find and rate you.
            </p>
          </div>
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider border border-zinc-950 dark:border-white transition-colors"
          >
            <span>Complete Store Onboarding →</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Store Tabs if multiple stores */}
          {stores.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {stores.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStoreIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase font-semibold whitespace-nowrap transition-colors border ${
                    selectedStoreIndex === idx
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {activeStore && (
            <>
              {/* Store Summary Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Store Profile Card with GPS */}
                <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                        Store Details
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {activeStore.category || 'General'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white mt-1">
                      {activeStore.name}
                    </h3>
                    <div className="flex items-start gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mt-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{activeStore.address}</span>
                    </div>
                    {activeStore.latitude !== undefined && activeStore.longitude !== undefined && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                        <Navigation className="w-3 h-3" />
                        <span>GPS: {activeStore.latitude.toFixed(4)}°, {activeStore.longitude.toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <Link
                      href={`/stores/${activeStore.id}`}
                      className="text-xs font-mono uppercase font-bold text-zinc-950 dark:text-white hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>View Public Page</span>
                    </Link>
                    <span className="font-mono text-[10px] text-zinc-400">
                      ID: {activeStore.id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Average Rating Card */}
                <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                      Average Rating
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      {activeStore.averageRating !== null ? (
                        <>
                          <span className="text-4xl font-mono font-extrabold text-zinc-950 dark:text-white">
                            {activeStore.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">/ 5.0</span>
                        </>
                      ) : (
                        <span className="text-base font-mono text-zinc-400">
                          No ratings yet
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <StarRating rating={activeStore.averageRating} size="md" />
                  </div>
                </div>

                {/* Total Ratings Card */}
                <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                      Total Submissions
                    </span>
                    <div className="text-4xl font-mono font-extrabold text-zinc-950 dark:text-white mt-2">
                      {activeStore.totalRatings}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{activeStore.ratings.length} customer reviews</span>
                  </div>
                </div>
              </div>

              {/* Store Photos Management Box */}
              <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-zinc-600" />
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                        Shop Photos & Visual Showcase
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Upload store photos to attract more shoppers and raters.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors shrink-0 self-start sm:self-auto">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadOwnerPhotos}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {activeStore.photos && activeStore.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                    {activeStore.photos.map((url, pIdx) => (
                      <div
                        key={pIdx}
                        className="group relative aspect-square overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
                      >
                        <img
                          src={url}
                          alt={`Store photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-zinc-950 text-[9px] font-mono font-bold text-white border border-white/20">
                          #{pIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <Camera className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <p className="text-xs font-mono">No photos uploaded for this store yet.</p>
                  </div>
                )}
              </div>

              {/* Customer Ratings Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-600" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                      Customers Who Rated This Store
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                      {activeStore.ratings.length}
                    </span>
                  </div>
                </div>

                {activeStore.ratings.length === 0 ? (
                  <div className="text-center py-12 px-4 text-zinc-400">
                    <Star className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-mono">No customer ratings submitted yet for this store.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                          <th className="py-3 px-5">Customer</th>
                          <th className="py-3 px-5">Rating</th>
                          <th className="py-3 px-5">Review & Feedback</th>
                          <th className="py-3 px-5 whitespace-nowrap">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                        {activeStore.ratings.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors align-top"
                          >
                            <td className="py-3.5 px-5 font-medium text-zinc-950 dark:text-white">
                              <div className="flex items-start gap-2.5">
                                <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-zinc-300 dark:border-zinc-600">
                                  {entry.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-zinc-950 dark:text-white truncate max-w-[160px]">
                                    {entry.user.name}
                                  </div>
                                  <div className="text-zinc-500 font-mono text-[10px] truncate max-w-[160px]">
                                    {entry.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  ★ {entry.rating}
                                </span>
                                <StarRating rating={entry.rating} size="sm" />
                              </div>
                            </td>
                            <td className="py-3.5 px-5 max-w-md">
                              {entry.review ? (
                                <div className="space-y-1.5">
                                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                                    "{entry.review}"
                                  </p>
                                  {entry.photos && entry.photos.length > 0 && (
                                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                                      {entry.photos.map((photoUrl, pIdx) => (
                                        <a
                                          key={pIdx}
                                          href={photoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="relative w-12 h-12 border border-zinc-300 dark:border-zinc-700 shrink-0 hover:opacity-80 transition"
                                          title="View full photo"
                                        >
                                          <img
                                            src={photoUrl}
                                            alt="Review attachment"
                                            className="w-full h-full object-cover"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-0.5">
                                    <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-semibold">
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{entry.likesCount || 0}</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-zinc-500 font-semibold">
                                      <ThumbsDown className="w-3 h-3" />
                                      <span>{entry.dislikesCount || 0}</span>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-400 italic">
                                  Rating submitted without written review
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-mono">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span>
                                  {new Date(entry.updatedAt || entry.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
