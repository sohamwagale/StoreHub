'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DiscoverRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stores');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-foreground border-t-rating animate-spin mx-auto" />
        <p className="text-xs font-mono uppercase tracking-wider text-muted">
          Redirecting to Explore Stores...
        </p>
      </div>
    </div>
  );
}
