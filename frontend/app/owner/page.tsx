'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OwnerStoreData, OwnerRatingEntry } from '@/types';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import {
  Shield,
  Store as StoreIcon,
  Users,
  Star,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Clock,
  Mail,
  User as UserIcon,
  RefreshCw,
  Camera,
  Upload,
  CheckCircle,
  Navigation,
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
        setError('Access denied. This dashboard is restricted to Store Owners only.');
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
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Unauthorized screen for normal users
  if (user && user.role !== 'OWNER') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Owner Access Restricted
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            Your current account has the <span className="font-semibold text-emerald-600">USER</span> role. Only registered <span className="font-semibold text-indigo-600">OWNER</span> accounts can access the store management dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              Go to Shopper Dashboard
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-900/40">
            <Shield className="w-3.5 h-3.5" />
            <span>Owner Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Store Performance & Customer Ratings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time insights and customer rating records for your registered locations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <span>+ Add Store</span>
          </Link>

          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {photoSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{photoSuccessMsg}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <StoreIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              No store registered yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              Complete your store profile onboarding to set your coordinates, address, and photos so customers can find and rate you.
            </p>
          </div>
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition transform active:scale-95"
          >
            <span>Complete Store Onboarding →</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Store Tabs if multiple stores */}
          {stores.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {stores.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStoreIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedStoreIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Store Profile Card with GPS */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                        Store Details
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {activeStore.category || 'General'}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                      {activeStore.name}
                    </h3>
                    <div className="flex items-start gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mt-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{activeStore.address}</span>
                    </div>
                    {activeStore.latitude !== undefined && activeStore.longitude !== undefined && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        <Navigation className="w-3 h-3" />
                        <span>GPS: {activeStore.latitude.toFixed(4)}°, {activeStore.longitude.toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <Link
                      href="/"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Locate on Map</span>
                    </Link>
                    <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      ID: {activeStore.id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Average Rating Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                      Average Rating
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      {activeStore.averageRating !== null ? (
                        <>
                          <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                            {activeStore.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm font-semibold text-zinc-400">/ 5.0</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-zinc-400 italic">
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
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                      Total Submissions
                    </span>
                    <div className="text-4xl font-extrabold text-zinc-900 dark:text-white mt-2">
                      {activeStore.totalRatings}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>{activeStore.ratings.length} verified customer reviews</span>
                  </div>
                </div>
              </div>

              {/* Store Photos Management Box */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        Shop Photos & Visual Showcase
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Upload high-resolution store photos to attract more shoppers and raters.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-95 shrink-0 self-start sm:self-auto">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Shop Photos'}</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                    {activeStore.photos.map((url, pIdx) => (
                      <div
                        key={pIdx}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100"
                      >
                        <img
                          src={url}
                          alt={`Store photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white backdrop-blur-xs">
                          #{pIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">No photos uploaded for this store yet.</p>
                  </div>
                )}
              </div>

              {/* Customer Ratings Table / List */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Customers Who Rated This Store
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {activeStore.ratings.length}
                    </span>
                  </div>
                </div>

                {activeStore.ratings.length === 0 ? (
                  <div className="text-center py-12 px-4 text-zinc-400">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No customer ratings submitted yet for this store.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50/70 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <th className="py-3.5 px-6">Customer</th>
                          <th className="py-3.5 px-6">Email Address</th>
                          <th className="py-3.5 px-6">Submitted Rating</th>
                          <th className="py-3.5 px-6">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                        {activeStore.ratings.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                                {entry.user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[200px]">{entry.user.name}</span>
                            </td>
                            <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300 font-mono text-xs">
                              {entry.user.email}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-500">
                                  ★ {entry.rating}
                                </span>
                                <StarRating rating={entry.rating} size="sm" />
                              </div>
                            </td>
                            <td className="py-4 px-6 text-xs text-zinc-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
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
