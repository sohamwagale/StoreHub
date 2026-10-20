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
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Redirecting to Explore Stores...
        </p>
      </div>
    </div>
  );
}
