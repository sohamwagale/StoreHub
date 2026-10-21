'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OwnerStoreData } from '@/types';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import { OwnerDashboardSkeleton, MetricCardSkeleton, ReviewItemSkeleton } from '@/components/Skeleton';
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
  Edit3,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState<OwnerStoreData[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [deletingPhotoUrl, setDeletingPhotoUrl] = useState<string | null>(null);
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

  const handleDeleteOwnerPhoto = async (photoUrl: string) => {
    const activeStore = stores[selectedStoreIndex];
    if (!activeStore) return;

    if (!confirm('Are you sure you want to delete this store photo?')) {
      return;
    }

    setDeletingPhotoUrl(photoUrl);
    setError(null);
    setPhotoSuccessMsg(null);
    try {
      await api.stores.deletePhoto(activeStore.id, photoUrl);
      setPhotoSuccessMsg('Store photo deleted successfully.');
      setStores((prevStores) =>
        prevStores.map((s, idx) =>
          idx === selectedStoreIndex
            ? { ...s, photos: (s.photos || []).filter((p) => p !== photoUrl) }
            : s
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to delete store photo');
    } finally {
      setDeletingPhotoUrl(null);
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
    return <OwnerDashboardSkeleton />;
  }

  // Unauthorized screen for normal users
  if (user && user.role !== 'OWNER') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface p-8 border border-border text-center">
          <div className="w-12 h-12 mx-auto bg-muted-fill border border-border text-foreground flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
            Owner Access Restricted
          </h2>
          <p className="text-xs text-muted mt-2 mb-6">
            Your current account has the USER role. Only registered OWNER accounts can access the store management dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-foreground text-background border border-foreground transition-colors"
            >
              Go to Shopper Dashboard
            </Link>
            <Link
              href="/stores"
              className="py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-muted-fill hover:bg-muted-fill text-muted border border-border transition-colors"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted mb-1">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>Owner Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Store Performance & Customer Ratings
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time ratings, reviews, and photo gallery management for your registered locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-foreground text-background border border-foreground hover:bg-accent-hover transition-colors"
          >
            <span>+ Add Store</span>
          </Link>

          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-surface border border-border text-muted hover:bg-muted-fill transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-muted-fill border-l-2 border-red-500 flex items-start gap-3 text-foreground text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {photoSuccessMsg && (
        <div className="p-3 bg-muted-fill border-l-2 border-emerald-500 flex items-start gap-3 text-foreground text-xs font-mono">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <p>{photoSuccessMsg}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
          <div className="bg-surface border border-border p-6 space-y-4">
            <div className="divide-y divide-border">
              <ReviewItemSkeleton />
              <ReviewItemSkeleton />
            </div>
          </div>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 px-4 bg-surface border border-border max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto bg-muted-fill border border-border flex items-center justify-center text-muted">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
              No store registered yet
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Complete your store profile onboarding to set your coordinates, address, and photos so customers can find and rate you.
            </p>
          </div>
          <Link
            href="/owner/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider border border-foreground transition-colors"
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
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface text-muted border-border hover:border-foreground'
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
                <div className="bg-surface p-5 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted">
                        Store Details
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-muted-fill text-muted border border-border">
                        {activeStore.category || 'General'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-1">
                      {activeStore.name}
                    </h3>
                    <div className="flex items-start gap-1.5 text-muted text-xs mt-2">
                      <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                      <span>{activeStore.address}</span>
                    </div>
                    {activeStore.openingHours && (
                      <div className="flex items-center gap-1.5 text-muted text-[11px] font-mono mt-1.5">
                        <Clock className="w-3 h-3 text-muted shrink-0" />
                        <span className="truncate">{activeStore.openingHours}</span>
                      </div>
                    )}
                    {activeStore.latitude !== undefined && activeStore.longitude !== undefined && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border text-[10px] font-mono text-muted">
                        <Navigation className="w-3 h-3" />
                        <span>GPS: {activeStore.latitude.toFixed(4)}°, {activeStore.longitude.toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/stores/${activeStore.id}`}
                        className="text-xs font-mono uppercase font-bold text-foreground hover:underline flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Public Page</span>
                      </Link>
                      <Link
                        href={`/owner/onboarding?edit=${activeStore.id}`}
                        className="text-xs font-mono uppercase font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Details</span>
                      </Link>
                    </div>
                    <span className="font-mono text-[10px] text-muted">
                      ID: {activeStore.id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Average Rating Card */}
                <div className="bg-surface p-5 border border-border flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted">
                      Average Rating
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      {activeStore.averageRating !== null ? (
                        <>
                          <span className="text-4xl font-mono font-extrabold text-foreground">
                            {activeStore.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-muted">/ 5.0</span>
                        </>
                      ) : (
                        <span className="text-base font-mono text-muted">
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
                <div className="bg-surface p-5 border border-border flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted">
                      Total Submissions
                    </span>
                    <div className="text-4xl font-mono font-extrabold text-foreground mt-2">
                      {activeStore.totalRatings}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted">
                    <Users className="w-3.5 h-3.5 text-muted" />
                    <span>{activeStore.ratings.length} customer reviews</span>
                  </div>
                </div>
              </div>

              {/* Store Photos Management Box */}
              <div className="bg-surface p-5 border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-muted" />
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                        Shop Photos & Visual Showcase
                      </h3>
                      <p className="text-xs text-muted">
                        Upload store photos to attract more shoppers and raters.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-bold text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors shrink-0 self-start sm:self-auto">
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
                        className="group relative aspect-square overflow-hidden border border-border bg-muted-fill"
                      >
                        <img
                          src={url}
                          alt={`Store photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black text-[9px] font-mono font-bold text-white border border-white/20">
                          #{pIdx + 1}
                        </div>
                        <button
                          type="button"
                          disabled={deletingPhotoUrl === url}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOwnerPhoto(url);
                          }}
                          title="Delete this store photo"
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-600 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                          {deletingPhotoUrl === url ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted">
                    <Camera className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <p className="text-xs font-mono">No photos uploaded for this store yet.</p>
                  </div>
                )}
              </div>

              {/* Customer Ratings Table */}
              <div className="bg-surface border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                      Customers Who Rated This Store
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-muted-fill text-muted border border-border">
                      {activeStore.ratings.length}
                    </span>
                  </div>
                </div>

                {activeStore.ratings.length === 0 ? (
                  <div className="text-center py-12 px-4 text-muted">
                    <Star className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-mono">No customer ratings submitted yet for this store.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted-fill border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted">
                          <th className="py-3 px-5">Customer</th>
                          <th className="py-3 px-5">Rating</th>
                          <th className="py-3 px-5">Review & Feedback</th>
                          <th className="py-3 px-5 whitespace-nowrap">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {activeStore.ratings.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-muted-fill/30 transition-colors align-top"
                          >
                            <td className="py-3.5 px-5 font-medium text-foreground">
                              <div className="flex items-start gap-2.5">
                                <div className="w-6 h-6 bg-muted-fill text-foreground font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-border">
                                  {entry.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-foreground truncate max-w-[160px]">
                                    {entry.user.name}
                                  </div>
                                  <div className="text-muted font-mono text-[10px] truncate max-w-[160px]">
                                    {entry.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-rating text-xs">
                                  ★ {entry.rating}
                                </span>
                                <StarRating rating={entry.rating} size="sm" />
                              </div>
                            </td>
                            <td className="py-3.5 px-5 max-w-md">
                              {entry.review ? (
                                <div className="space-y-1.5">
                                  <p className="text-xs text-foreground leading-relaxed font-sans">
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
                                          className="relative w-12 h-12 border border-border shrink-0 hover:opacity-80 transition"
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
                                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted pt-0.5">
                                    <span className="flex items-center gap-1 text-muted font-semibold">
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{entry.likesCount || 0}</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-muted font-semibold">
                                      <ThumbsDown className="w-3 h-3" />
                                      <span>{entry.dislikesCount || 0}</span>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted italic">
                                  Rating submitted without written review
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-muted whitespace-nowrap font-mono">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-muted" />
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
