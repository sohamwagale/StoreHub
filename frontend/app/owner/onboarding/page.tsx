'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Store as StoreIcon,
  MapPin,
  Camera,
  Upload,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Navigation,
  X,
} from 'lucide-react';
import { OnboardingSkeleton } from '@/components/Skeleton';

const CATEGORIES = [
  'Grocery',
  'Malls',
  'Clothes',
  'Electronics',
  'Bakery',
  'Bookstore',
  'Restaurant',
  'Fitness & Health',
  'General',
];

const PRESET_COORDINATES = [
  { label: 'New York', lat: 40.7128, lng: -74.006 },
  { label: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { label: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
];

export default function OwnerOnboardingPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(40.7128);
  const [longitude, setLongitude] = useState<number>(-74.006);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // UI States
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'OWNER') {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      (err) => {
        setError(`Location detection failed: ${err.message}. You can manually type coordinates.`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setError(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      setUploadedPhotos((prev) => [...prev, ...res.urls]);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Store name must be at least 2 characters.');
      return;
    }
    if (name.trim().length > 100) {
      setError('Store name cannot exceed 100 characters.');
      return;
    }
    if (address.trim().length < 5) {
      setError('Please provide a valid physical store address (min 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        category,
        address: address.trim(),
      };
      if (typeof latitude === 'number' && !isNaN(latitude)) {
        payload.latitude = latitude;
      }
      if (typeof longitude === 'number' && !isNaN(longitude)) {
        payload.longitude = longitude;
      }
      if (uploadedPhotos && uploadedPhotos.length > 0) {
        payload.photos = uploadedPhotos;
      }

      await api.stores.create(payload);
      router.push('/owner?onboarded=true');
    } catch (err: any) {
      setError(err?.message || 'Failed to register store. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <OnboardingSkeleton />;
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Onboarding Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[11px] font-mono uppercase font-bold tracking-widest mb-3">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>Store Owner Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Register Your Store
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Set up your store profile with accurate coordinates, category, and visual photos so shoppers can discover, visit, and rate your business.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-start gap-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          {/* Section 1: Basic Information */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
              <StoreIcon className="w-3.5 h-3.5 text-zinc-600" />
              <span>1. Store Identity & Category</span>
            </h3>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Basket Organic Grocery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Store Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase font-semibold text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Physical Location & GPS Coordinates */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
              <span>2. Store Location & GPS Coordinates</span>
            </h3>

            {/* Physical Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Full Physical Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 542 Pine St, Suite 10, Seattle, WA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            {/* Location Helper Actions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting...' : '📍 Auto-detect GPS'}</span>
              </button>

              <span className="text-[10px] font-mono text-zinc-400">or presets:</span>

              {PRESET_COORDINATES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setLatitude(preset.lat);
                    setLongitude(preset.lng);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-950 border border-transparent transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Photos Showcase */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-zinc-600" />
              <span>3. Store Photos & Visuals</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Upload photos of your storefront or interior to authenticate your store profile.
            </p>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden border border-zinc-300 dark:border-zinc-700 group bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                {isUploadingPhoto ? 'Uploading...' : 'Click to Upload Photos'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 font-mono font-bold uppercase tracking-wider text-xs text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Registering Store...</span>
              </>
            ) : (
              <>
                <span>Publish Store Profile & Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            Live Customer Preview
          </div>

          {/* Preview Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="relative w-full h-44 bg-zinc-900 overflow-hidden">
              {uploadedPhotos.length > 0 ? (
                <img
                  src={uploadedPhotos[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                  <Camera className="w-7 h-7 opacity-40 mb-1" />
                  <span className="text-[10px] font-mono uppercase opacity-60">Store Photo Preview</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-zinc-950 text-white border border-white/20">
                {category}
              </div>
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-mono font-bold bg-zinc-950 text-amber-400 border border-amber-400/40">
                ★ New
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                  {name.trim() || 'Store Name Here'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{address.trim() || 'Store physical address...'}</span>
                </p>
              </div>

              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>GPS:</span>
                <span>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>0 Reviews</span>
                <span className="text-zinc-950 dark:text-white font-bold">Ready for Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
