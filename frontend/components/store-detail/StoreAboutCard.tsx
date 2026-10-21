import React from 'react';
import { Store } from '@/types';
import { Store as StorefrontIcon, CheckCircle2 } from 'lucide-react';

interface StoreAboutCardProps {
  store: Store;
}

export default function StoreAboutCard({ store }: StoreAboutCardProps) {
  const defaultHighlights = [
    { title: 'Authentic Inventory', description: 'Verified stocks' },
    { title: 'Instant Support', description: 'On-premise desk' },
    { title: 'Accessible', description: 'Wheelchair ramp' },
    { title: 'Fair Pricing', description: 'Zero markup' },
  ];

  const highlights = store.highlights && store.highlights.length > 0
    ? store.highlights
    : defaultHighlights;

  return (
    <section className="bg-surface border border-border p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <StorefrontIcon className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground font-mono">
          About {store.name}
        </h2>
      </div>

      <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans whitespace-pre-line">
        {store.description ||
          `${store.name} is a premier ${store.category || 'retail'} establishment based at ${store.address}. Serving the local community with authentic product selections, certified customer service, and real-time community accountability.`}
      </p>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {highlights.map((h, idx) => (
          <div key={idx} className="p-3 bg-muted-fill border border-border text-center">
            <CheckCircle2 className="w-4 h-4 text-accent mx-auto mb-1" />
            <span className="text-[10px] font-mono font-bold uppercase text-foreground block truncate" title={h.title}>
              {h.title}
            </span>
            <span className="text-[9px] text-muted block truncate" title={h.description}>
              {h.description}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
