import React from 'react';
import { LayoutGrid, Map as MapIcon, Columns } from 'lucide-react';

export type ViewMode = 'grid' | 'map' | 'split';

interface StoreViewModeSwitchProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function StoreViewModeSwitch({
  viewMode,
  onViewModeChange,
}: StoreViewModeSwitchProps) {
  return (
    <div className="flex items-center border border-border bg-muted-fill p-0.5 self-stretch sm:self-auto">
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
          viewMode === 'grid'
            ? 'bg-foreground text-background border border-foreground'
            : 'text-muted hover:text-foreground border border-transparent'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Grid</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('map')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
          viewMode === 'map'
            ? 'bg-foreground text-background border border-foreground'
            : 'text-muted hover:text-foreground border border-transparent'
        }`}
      >
        <MapIcon className="w-3.5 h-3.5" />
        <span>Map</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('split')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold transition ${
          viewMode === 'split'
            ? 'bg-foreground text-background border border-foreground'
            : 'text-muted hover:text-foreground border border-transparent'
        }`}
      >
        <Columns className="w-3.5 h-3.5" />
        <span>Split</span>
      </button>
    </div>
  );
}
