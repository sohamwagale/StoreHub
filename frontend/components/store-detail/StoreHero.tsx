import React from 'react';
import { Store } from '@/types';
import {
  MapPin,
  CheckCircle,
  CheckCircle2,
  Phone,
  Globe,
  Bookmark,
  Share2,
  Edit3,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface StoreHeroProps {
  store: Store;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onWriteReviewClick: () => void;
  CategoryIcon: LucideIcon;
  userHasRated: boolean;
}

export default function StoreHero({
  store,
  isBookmarked,
  onToggleBookmark,
  onShare,
  onWriteReviewClick,
  CategoryIcon,
  userHasRated,
}: StoreHeroProps) {
  return (
    <section className="bg-surface border-b border-border py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Badges, Title, Address & Meta */}
          <div className="flex-1">
            {/* Category & Verified Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase bg-muted-fill text-foreground border border-border">
                <CategoryIcon className="w-3.5 h-3.5 text-accent" />
                <span>{store.category || 'General Retail'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Store</span>
              </span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {store.name}
              </h1>
              <CheckCircle className="w-5 h-5 text-accent shrink-0" />
            </div>

            {/* Address Line with Map Anchor */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted mb-3">
              <MapPin className="w-4 h-4 text-muted shrink-0" />
              <span>{store.address}</span>
              <span className="text-muted mx-1">•</span>
              <a
                href="#map-section"
                className="font-mono text-xs uppercase font-bold text-foreground underline hover:no-underline inline-flex items-center gap-1"
              >
                <span>View on Map</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-muted pt-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                </span>
                <span>{store.openingHours || 'Open Now · 9:30 AM – 9:00 PM'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted" />
                <a href={`tel:${store.phone || '+919823045678'}`} className="hover:text-foreground">
                  {store.phone || '+91 98230 45678'}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted" />
                <a
                  href={store.website || `https://storerank.platform`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  {store.website ? store.website.replace(/^https?:\/\//, '') : `storerank.in/${store.name?.toLowerCase().replace(/\s+/g, '')}`}
                </a>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons Cluster */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`inline-flex items-center gap-1.5 px-3.5 h-10 border text-xs font-mono uppercase font-bold transition-colors ${
                isBookmarked
                  ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-950 dark:hover:border-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-amber-400 dark:text-amber-600 fill-current' : 'text-zinc-500'}`} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 px-3.5 h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono uppercase font-bold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Share</span>
            </button>

            <a
              href="#user-rating-section"
              onClick={onWriteReviewClick}
              className="inline-flex items-center gap-1.5 px-4 h-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-950 dark:border-white text-xs font-mono uppercase font-bold transition-colors shadow-none"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>{userHasRated ? 'Update Rating' : 'Write a Review'}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
