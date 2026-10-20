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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Navigation,
  X,
  Building2,
  ShoppingBag,
  Coffee,
  Shirt,
  Laptop,
} from 'lucide-react';

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

  // Geolocation detection
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

  // Upload store photos
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
      await api.stores.create({
        name: name.trim(),
        category,
        address: address.trim(),
        latitude,
        longitude,
        photos: uploadedPhotos,
      });

      // Redirect to owner dashboard
      router.push('/owner?onboarded=true');
    } catch (err: any) {
      setError(err?.message || 'Failed to register store. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Onboarding Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 text-xs font-semibold mb-3 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Store Owner Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Register Your Store
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Set up your store profile with accurate location coordinates, category, and visual photos so shoppers can discover, visit, and rate your business.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-indigo-500" />
              <span>1. Store Identity & Category</span>
            </h3>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Basket Organic Grocery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Store Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 2: Physical Location & GPS Coordinates */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>2. Store Location & GPS Coordinates</span>
            </h3>

            {/* Physical Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Physical Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 542 Pine St, Suite 10, Seattle, WA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Location Helper Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting...' : '📍 Auto-detect My Location'}</span>
              </button>

              <span className="text-xs text-zinc-400">or presets:</span>

              {PRESET_COORDINATES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setLatitude(preset.lat);
                    setLongitude(preset.lng);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Photos Showcase */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              <span>3. Store Photos & Visuals</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Upload photos of your storefront, aisles, or products to make your shop look authentic and attractive.
            </p>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group"
                  >
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition">
              <Upload className="w-5 h-5 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {isUploadingPhoto ? 'Uploading...' : 'Click to Upload Store Photos'}
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
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Store...</span>
              </>
            ) : (
              <>
                <span>Publish Store Profile & Open Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Customer Preview</span>
          </div>

          {/* Preview Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="relative w-full h-44 bg-zinc-800 overflow-hidden">
              {uploadedPhotos.length > 0 ? (
                <img
                  src={uploadedPhotos[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/20 to-zinc-900 text-zinc-400">
                  <Camera className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[11px] font-medium opacity-60">Store Photo Preview</span>
                </div>
              )}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-md">
                {category}
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                <span>★ New</span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {name.trim() || 'Store Name Here'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{address.trim() || 'Store physical address...'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>GPS:</span>
                <span>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>0 Reviews</span>
                <span>Ready to Accept Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
