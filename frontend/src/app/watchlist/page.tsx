'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, Bell, BellOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button, Card, Badge } from '@/components/ui';
import { AuctionCard } from '@/components/auction';
import type { Auction } from '@/types';

export default function WatchlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/watchlist');
      return;
    }

    // TODO: Load watchlist from API
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              My Watchlist
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Items you're watching. Get notified when there's bidding activity.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Browse our auctions and click the heart icon to add items to your watchlist.
            </p>
            <Button onClick={() => router.push('/auctions')}>
              Browse Auctions
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((auction) => (
              <div key={auction._id} className="relative group">
                <AuctionCard auction={auction} />
                <button 
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-12 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Notify me when I'm outbid
              </span>
              <input type="checkbox" defaultChecked className="form-checkbox" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Notify me when watched auctions end soon (1 hour)
              </span>
              <input type="checkbox" defaultChecked className="form-checkbox" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Notify me of new bids on watched items
              </span>
              <input type="checkbox" className="form-checkbox" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
