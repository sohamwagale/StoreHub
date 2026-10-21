import React from 'react';

/**
 * Base primitive for flat monochromatic loading skeletons
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-muted-fill ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton clone for StoreCard (used on /stores and discover)
 */
export function StoreCardSkeleton() {
  return (
    <div className="bg-surface border border-border flex flex-col justify-between overflow-hidden">
      {/* Cover Skeleton */}
      <div className="relative aspect-[16/9] w-full bg-muted-fill animate-pulse border-b border-border flex items-center justify-center">
        <div className="w-8 h-8 bg-muted-fill animate-pulse" />
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category Tag & Rating Stars Row */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Store Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Address Line */}
          <Skeleton className="h-3.5 w-5/6" />

          {/* Rating Summary Line */}
          <div className="pt-2 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-3 border-t border-border flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of StoreCardSkeletons
 */
export function StoreCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <StoreCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Metric KPI Box Skeleton
 */
export function MetricCardSkeleton() {
  return (
    <div className="p-5 bg-surface border border-border flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-8 h-8" />
      </div>
      <div>
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

/**
 * Review Item Skeleton for Lists and Modals
 */
export function ReviewItemSkeleton() {
  return (
    <div className="p-5 space-y-3.5 bg-surface border-b border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-9 h-9 shrink-0" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-border">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full Dashboard Skeleton for /dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-surface/60 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-3.5 w-80" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Quick Metrics (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Reviews List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface border border-border">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-36" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-44" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <ReviewItemSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            {/* Saved Favorites Widget Skeleton */}
            <div className="bg-surface border border-border p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border border-border bg-muted-fill space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3.5 w-8" />
                    </div>
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                ))}
              </div>
            </div>

            {/* Reputation Widget Skeleton */}
            <div className="bg-surface border border-border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Store Detail Page Skeleton for /stores/[id]
 */
export function StoreDetailSkeleton() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-20" />
        <span className="text-border">/</span>
        <Skeleton className="h-3.5 w-16" />
        <span className="text-border">/</span>
        <Skeleton className="h-3.5 w-32" />
      </div>

      {/* Main Header Card */}
      <div className="bg-surface border border-border p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-3/4 max-w-md" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-10" />
          </div>
        </div>

        {/* Rating Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-muted-fill border border-border space-y-2">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-12" />
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-3.5 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <ReviewItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-44 w-full" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Owner Dashboard Skeleton for /owner
 */
export function OwnerDashboardSkeleton() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3.5 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Metrics Row (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Store Content Card */}
      <div className="bg-surface border border-border p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <ReviewItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton for /profile
 */
export function ProfileSkeleton() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
      <div className="bg-surface p-6 sm:p-8 border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border">
          <Skeleton className="w-16 h-16 shrink-0" />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3.5 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-3.5 w-36 mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Onboarding Form Skeleton for /owner/onboarding
 */
export function OnboardingSkeleton() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="space-y-2 pb-4 border-b border-border">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3.5 w-80" />
      </div>

      <div className="bg-surface p-6 sm:p-8 border border-border space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full pt-4" />
      </div>
    </div>
  );
}
