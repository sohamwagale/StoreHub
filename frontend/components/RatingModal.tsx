'use client';

import React, { useState, useEffect } from 'react';
import { Store } from '@/types';
import StarRating from './StarRating';
import { X, CheckCircle, AlertCircle, Loader2, Camera, Upload, Trash2, Plus } from 'lucide-react';
import { api } from '@/lib/api';

interface RatingModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({
  store,
  isOpen,
  onClose,
  onSuccess,
}: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (store && isOpen) {
      setSelectedRating(store.userRating || 5);
      setError(null);
      setSuccessMessage(null);
      setPhotoUrlInput('');

      // Fetch user's previous review text and photos if available
      api.ratings
        .getMyRatingForStore(store.id)
        .then((data) => {
          if (data) {
            setReviewText(data.review || '');
            setPhotos(data.photos || []);
          } else {
            setReviewText('');
            setPhotos([]);
          }
        })
        .catch(() => {
          setReviewText('');
          setPhotos([]);
        });
    }
  }, [store, isOpen]);

  if (!isOpen || !store) return null;

  const isUpdating = store.userRating !== null && store.userRating !== undefined;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      setPhotos((prev) => [...prev, ...res.urls]);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setPhotos((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isUpdating) {
        await api.ratings.update(store.id, selectedRating, reviewText, photos);
        setSuccessMessage('Your rating, review, and photos have been updated successfully!');
      } else {
        await api.ratings.submit(store.id, selectedRating, reviewText, photos);
        setSuccessMessage('Thank you! Your rating, review, and photos have been submitted.');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">
            {isUpdating ? 'Update Feedback' : 'Rate Experience'}
          </span>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white mt-0.5">
            {store.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {store.address}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-red-500 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 border-l-2 border-emerald-500 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center justify-center py-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <StarRating
              rating={selectedRating}
              interactive={true}
              onChange={setSelectedRating}
              size="lg"
              disabled={isSubmitting}
            />

            {/* Quick 1-5 selector buttons */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedRating(val)}
                  disabled={isSubmitting}
                  className={`w-9 h-9 font-mono font-bold text-xs border transition-colors ${
                    selectedRating === val
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white'
                  }`}
                >
                  {val}★
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-2 uppercase">
              {selectedRating === 5 && 'Outstanding experience'}
              {selectedRating === 4 && 'Very good'}
              {selectedRating === 3 && 'Average'}
              {selectedRating === 2 && 'Poor'}
              {selectedRating === 1 && 'Terrible experience'}
            </span>
          </div>

          {/* Written Review Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Your Review <span className="text-zinc-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-400">{reviewText.length}/1000</span>
            </div>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={1000}
              placeholder="Tell other shoppers what you loved, service quality, recommendations..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none"
            />
          </div>

          {/* Photos Upload & Attachment Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Photos</span>
                <span className="text-zinc-400 font-mono text-[10px]">({photos.length})</span>
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  disabled={isUploading || isSubmitting}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group w-16 h-16 shrink-0 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove photo"
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Uploading photos...</span>
              </div>
            )}

            {/* Direct URL input fallback */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                disabled={!photoUrlInput.trim()}
                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isUpdating ? 'Update Rating' : 'Submit Rating'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
