'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gavel, Trophy, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { bidsApi } from '@/services/api';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Bid, Auction } from '@/types';

interface BidWithAuction extends Bid {
  auction?: Auction;
}

export default function MyBidsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeBids, setActiveBids] = useState<BidWithAuction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<BidWithAuction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'won'>('active');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/my-bids');
      return;
    }

    loadBids();
  }, [isAuthenticated, router]);

  const loadBids = async () => {
    try {
      const [myBidsResponse, winning] = await Promise.all([
        bidsApi.getMyBids(),
        bidsApi.getMyWinning(),
      ]);
      // API returns { bids, total } for pagination
      setActiveBids(myBidsResponse.bids || []);
      setWonAuctions(winning || []);
    } catch (error) {
      console.error('Failed to load bids:', error);
      setActiveBids([]);
      setWonAuctions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-8 w-8 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              My Bids
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Track your bidding activity and won auctions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'active'
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Bids
              {activeBids.length > 0 && (
                <Badge variant="gold" size="sm">{activeBids.length}</Badge>
              )}
            </div>
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('won')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'won'
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Won Auctions
              {wonAuctions.length > 0 && (
                <Badge variant="success" size="sm">{wonAuctions.length}</Badge>
              )}
            </div>
            {activeTab === 'won' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : activeTab === 'active' ? (
          activeBids.length === 0 ? (
            <Card className="p-12 text-center">
              <Gavel className="h-16 w-16 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                No active bids
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Start bidding on items you love.
              </p>
              <Button onClick={() => router.push('/auctions')}>
                Browse Auctions
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeBids.map((bid) => {
                const auctionId = typeof bid.auctionId === 'object' 
                  ? (bid.auctionId as any)?._id || (bid.auctionId as any)?.id 
                  : bid.auctionId;
                return (
                <Card key={bid._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link 
                        href={`/auctions/${auctionId}`}
                        className="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                      >
                        {bid.auction?.title || (bid.auctionId as any)?.title || 'Auction'}
                      </Link>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Your bid: {formatCurrency(bid.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      {bid.status === 'winning' || bid.isWinning ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Winning
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Outbid
                        </Badge>
                      )}
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Current: {formatCurrency(bid.auction?.currentBid || (bid.auctionId as any)?.currentBid || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              )})}
            </div>
          )
        ) : wonAuctions.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              No won auctions yet
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Keep bidding - your first win is just around the corner!
            </p>
            <Button onClick={() => router.push('/auctions')}>
              Browse Auctions
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {wonAuctions.map((bid) => {
              const auctionId = typeof bid.auctionId === 'object' 
                ? (bid.auctionId as any)?._id || (bid.auctionId as any)?.id 
                : bid.auctionId;
              return (
              <Card key={bid._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/auctions/${auctionId}`}
                      className="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                    >
                      {bid.auction?.title || (bid.auctionId as any)?.title || 'Auction'}
                    </Link>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Won for: {formatCurrency(bid.amount)}
                    </p>
                  </div>
                  <div>
                    <Badge variant="success">
                      <Trophy className="h-3 w-3 mr-1" />
                      Won
                    </Badge>
                  </div>
                </div>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
