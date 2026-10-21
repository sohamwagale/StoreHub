import React from 'react';
import { Store } from '@/types';
import { Store as StorefrontIcon, CheckCircle2 } from 'lucide-react';

interface StoreAboutCardProps {
  store: Store;
}

export default function StoreAboutCard({ store }: StoreAboutCardProps) {
  return (
    <section className="bg-surface border border-border p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <StorefrontIcon className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground font-mono">
          About {store.name}
        </h2>
      </div>

      <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
        {store.description ||
          `${store.name} is a premier ${store.category || 'retail'} establishment based at ${store.address}. Serving the local community with authentic product selections, certified customer service, and real-time community accountability.`}
      </p>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 bg-muted-fill border border-border text-center">
          <CheckCircle2 className="w-4 h-4 text-accent mx-auto mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase text-foreground block">
            Authentic Inventory
          </span>
          <span className="text-[9px] text-muted block">Verified stocks</span>
        </div>
        <div className="p-3 bg-muted-fill border border-border text-center">
          <CheckCircle2 className="w-4 h-4 text-accent mx-auto mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase text-foreground block">
            Instant Support
          </span>
          <span className="text-[9px] text-muted block">On-premise desk</span>
        </div>
        <div className="p-3 bg-muted-fill border border-border text-center">
          <CheckCircle2 className="w-4 h-4 text-accent mx-auto mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase text-foreground block">
            Accessible
          </span>
          <span className="text-[9px] text-muted block">Wheelchair ramp</span>
        </div>
        <div className="p-3 bg-muted-fill border border-border text-center">
          <CheckCircle2 className="w-4 h-4 text-accent mx-auto mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase text-foreground block">
            Fair Pricing
          </span>
          <span className="text-[9px] text-muted block">Zero markup</span>
        </div>
      </div>
    </section>
  );
}
