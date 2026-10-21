import React from 'react';
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Building2,
  Shirt,
  Laptop,
  Coffee,
  Store as StoreIcon,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'All', label: 'All Shops', icon: StoreIcon },
  { id: 'Grocery', label: 'Groceries', icon: ShoppingBag },
  { id: 'Malls', label: 'Shopping Malls', icon: Building2 },
  { id: 'Clothes', label: 'Apparel & Fashion', icon: Shirt },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Bakery', label: 'Bakery & Cafes', icon: Coffee },
];

interface StoreFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (catId: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalResults: number;
}

export default function StoreFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  sortOrder,
  onSortChange,
  onRefresh,
  isLoading,
  totalResults,
}: StoreFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search Input and Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search stores by name, category, or address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 bg-surface border border-border text-xs font-mono uppercase font-semibold text-muted focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="highest">★ Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh store listings"
            className="p-2 bg-surface border border-border text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategorySelect(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-semibold shrink-0 transition-colors border ${
                isSelected
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-surface text-muted border-border hover:border-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
