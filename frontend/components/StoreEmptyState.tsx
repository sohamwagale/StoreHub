import React from 'react';
import { Compass } from 'lucide-react';

interface StoreEmptyStateProps {
  onClearFilters: () => void;
}

export default function StoreEmptyState({ onClearFilters }: StoreEmptyStateProps) {
  return (
    <div className="text-center py-16 bg-surface border border-border p-8">
      <div className="w-10 h-10 mx-auto bg-muted-fill border border-border flex items-center justify-center text-muted mb-3">
        <Compass className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
        No matching stores found
      </h3>
      <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
        Try adjusting your search query, selecting another category, or clearing the filter.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-4 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
