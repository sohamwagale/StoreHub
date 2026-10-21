import React from 'react';
import Link from 'next/link';
import { Store } from '@/types';
import {
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  CheckCircle2,
  Store as StorefrontIcon,
  Star,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('@/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-muted-fill border border-border flex items-center justify-center text-muted">
      <div className="flex items-center gap-2 font-mono text-xs uppercase">
        <MapPin className="w-4 h-4 text-accent" />
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

interface StoreSidebarInfoProps {
  store: Store;
  similarStores: Store[];
}

export default function StoreSidebarInfo({
  store,
  similarStores,
}: StoreSidebarInfoProps) {
  return (
    <aside className="lg:col-span-5 flex flex-col gap-6">
      {/* 1. HOURS OF OPERATION TABLE */}
      <div className="bg-surface border border-border p-6 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Hours of Operation</span>
          </h3>
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
            Open Today
          </span>
        </div>

        <div className="divide-y divide-border text-xs font-mono">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
            return (
              <div
                key={day}
                className={`py-2 flex items-center justify-between ${
                  isToday ? 'bg-muted-fill px-2 font-bold text-foreground' : 'text-muted'
                }`}
              >
                <span>{day}{isToday ? ' (Today)' : ''}</span>
                <span>{day === 'Sunday' ? '10:00 AM – 8:30 PM' : '9:30 AM – 9:00 PM'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LOCATION & DIRECTIONS MAP CARD */}
      <div id="map-section" className="bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>Location &amp; Directions</span>
          </h3>
          <p className="text-xs text-muted mt-0.5 truncate">
            {store.address}
          </p>
        </div>

        {/* Map Preview */}
        <div className="relative h-48 bg-muted-fill">
          {store.latitude !== undefined && store.longitude !== undefined ? (
            <StoreMap
              stores={[store]}
              selectedStoreId={store.id}
              centerCoordinates={[store.longitude, store.latitude]}
              zoomLevel={15}
              heightClass="h-48"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted">
              GPS Coordinates not provided
            </div>
          )}
        </div>

        <div className="p-4 flex items-center justify-between gap-3 text-xs font-mono">
          <span className="text-muted">Free 2-hour parking available</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name} ${store.address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-foreground text-background font-bold border border-foreground transition-colors"
          >
            <span>Get Directions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3. VERIFIED MERCHANT BADGE */}
      <div className="p-5 bg-muted-fill border border-border flex items-start gap-4">
        <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center shrink-0 border border-foreground">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-foreground">
            <span>{store.name} Partner Account</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          </div>
          <p className="text-xs text-muted">
            Verified Merchant Account on StoreRank platform with direct customer dispute resolution.
          </p>
        </div>
      </div>

      {/* 4. SIMILAR STORES RECOMMENDATIONS */}
      {similarStores.length > 0 && (
        <div className="bg-surface border border-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground font-mono">
              Similar Stores Nearby
            </h3>
            <Link href="/stores" className="text-xs font-mono uppercase font-bold text-foreground underline hover:no-underline">
              Explore
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {similarStores.map((s) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="group flex items-center gap-3 p-3 border border-border hover:border-foreground bg-muted-fill transition-colors"
              >
                <div className="w-12 h-12 bg-muted-fill flex items-center justify-center shrink-0 border border-border">
                  {s.photos && s.photos.length > 0 ? (
                    <img src={s.photos[0]} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <StorefrontIcon className="w-5 h-5 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase text-foreground truncate group-hover:underline">
                      {s.name}
                    </h4>
                    <span className="flex items-center text-xs font-mono font-bold text-foreground">
                      <Star className="w-3 h-3 text-rating fill-rating mr-1" />
                      {s.averageRating !== null && s.averageRating !== undefined ? s.averageRating.toFixed(1) : 'NEW'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate">{s.address}</p>
                  <span className="text-[10px] font-mono uppercase text-muted">{s.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
