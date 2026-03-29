'use client';

import { useState, useCallback } from 'react';
import { Button, Badge, Input } from '@/components/ui';
import { bidsApi, auctionsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { useAuctionSocket, useCountdown } from '@/hooks';
import { formatCurrency, calculateMinimumBid } from '@/lib/utils';
import { AlertCircle, Clock, TrendingUp, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { Auction, NewBidEvent } from '@/types';

interface BidPanelProps {
  auction: Auction;
  onBidPlaced?: () => void;
}

export function BidPanel({ auction: initialAuction, onBidPlaced }: BidPanelProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAntiSnipeAlert, setShowAntiSnipeAlert] = useState(false);

  const minimumBid = calculateMinimumBid(auction.currentBid, auction.startingBid, auction.totalBids);
  // Max bid is buy now price - 1 (or no limit if no buy now)
  const maxBid = auction.buyNowPrice ? auction.buyNowPrice - 1 : undefined;

  const { days, hours, minutes, seconds, isEnded, updateEndDate } = useCountdown({
    endDate: auction.endsAt,
  });

  // Check auction status
  const isSold = auction.status === 'sold';
  const isClosed = auction.status === 'closed';
  const isLive = auction.status === 'live';
  const canBid = isLive && !isEnded && !isSold && !isClosed;

  // WebSocket for real-time updates
  const handleNewBid = useCallback((data: NewBidEvent) => {
    setAuction(prev => ({
      ...prev,
      currentBid: data.currentBid,
      totalBids: data.totalBids,
      endsAt: data.endsAt,
    }));
    updateEndDate(data.endsAt);

    if (data.antiSnipeTriggered) {
      setShowAntiSnipeAlert(true);
      setTimeout(() => setShowAntiSnipeAlert(false), 5000);
    }
  }, [updateEndDate]);

  // Handle auction sold via WebSocket
  const handleAuctionSold = useCallback(() => {
    setAuction(prev => ({
      ...prev,
      status: 'sold',
      buyNowUsed: true,
    }));
  }, []);

  useAuctionSocket({
    auctionId: auction._id,
    onNewBid: handleNewBid,
    onAuctionSold: handleAuctionSold,
  });

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to place a bid');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minimumBid) {
      setError(`Minimum bid is ${formatCurrency(minimumBid)}`);
      return;
    }

    // Check max bid
    if (maxBid && amount >= auction.buyNowPrice!) {
      setError(`Maximum bid is ${formatCurrency(maxBid)}. Use Buy Now for ${formatCurrency(auction.buyNowPrice!)}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await bidsApi.place(auction._id, amount);
      if (result.success) {
        setSuccess(`Bid of ${formatCurrency(amount)} placed successfully!`);
        setBidAmount('');
        onBidPlaced?.();
        
        if (result.auction) {
          setAuction(prev => ({
            ...prev,
            currentBid: result.auction!.currentBid,
            totalBids: result.auction!.totalBids,
            endsAt: result.auction!.endsAt,
          }));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to buy now');
      return;
    }

    if (!confirm(`Are you sure you want to buy this item for ${formatCurrency(auction.buyNowPrice!)}? This action is final.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await auctionsApi.buyNow(auction._id);
      setSuccess(`Congratulations! You purchased this item for ${formatCurrency(result.price)}`);
      setAuction(prev => ({
        ...prev,
        ...result.auction,
        status: 'sold',
        buyNowUsed: true,
      }));
      onBidPlaced?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const isEndingSoon = !isEnded && !isSold && !isClosed && days === 0 && hours < 2;
  const isUserWinning = user && auction.currentWinnerId === user.id;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      {/* SOLD banner */}
      {isSold && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-center">
          <CheckCircle className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-2" />
          <span className="text-xl font-bold text-[var(--color-primary)]">SOLD</span>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            This item has been purchased
          </p>
        </div>
      )}

      {/* CLOSED banner */}
      {isClosed && !isSold && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-center">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <span className="text-xl font-bold text-red-400">AUCTION ENDED</span>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {auction.reserveMet ? 'Winner will be contacted' : 'Reserve not met'}
          </p>
        </div>
      )}

      {/* Timer - only show if not sold/closed */}
      {!isSold && !isClosed && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              {isEnded ? 'Auction Ended' : 'Time Remaining'}
            </span>
            {isLive && (
              <Badge variant="success" pulse>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Live
              </Badge>
            )}
          </div>
          
          {!isEnded ? (
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: days, label: 'Days' },
                { value: hours, label: 'Hours' },
                { value: minutes, label: 'Min' },
                { value: seconds, label: 'Sec' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className={`text-2xl font-bold ${isEndingSoon ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-primary)]'}`}>
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-2xl font-bold text-[var(--color-error)]">ENDED</div>
          )}
        </div>
      )}

      {/* Anti-snipe alert */}
      {showAntiSnipeAlert && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-400" />
          <span className="text-sm text-yellow-400">
            Bid extended! Anti-snipe protection activated.
          </span>
        </div>
      )}

      {/* Current/Final bid */}
      <div className="mb-6 p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[var(--color-text-muted)]">
            {isSold ? 'Sold For' : isClosed ? 'Final Bid' : auction.totalBids > 0 ? 'Current Bid' : 'Starting Bid'}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-3xl font-bold text-[var(--color-primary)]">
          {formatCurrency(auction.totalBids > 0 ? auction.currentBid : auction.startingBid)}
        </div>
        {isUserWinning && !isSold && !isClosed && (
          <div className="mt-2 flex items-center text-green-400 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            You are the highest bidder!
          </div>
        )}
        {isUserWinning && isSold && (
          <div className="mt-2 flex items-center text-[var(--color-primary)] text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Congratulations! You won this auction!
          </div>
        )}
      </div>

      {/* Reserve indicator - only show if auction is active */}
      {!auction.reserveMet && auction.totalBids > 0 && !isSold && !isClosed && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-400">Reserve not met</span>
        </div>
      )}

      {/* Bid form - only show if can bid */}
      {canBid && (
        <>
          <div className="space-y-4 mb-4">
            <div>
              <Input
                type="number"
                placeholder={`Min: ${formatCurrency(minimumBid)}${maxBid ? ` / Max: ${formatCurrency(maxBid)}` : ''}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minimumBid}
                max={maxBid}
                step="1"
              />
              {maxBid && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Maximum bid: {formatCurrency(maxBid)} (Buy Now available at {formatCurrency(auction.buyNowPrice!)})
                </p>
              )}
            </div>
            
            {/* Quick bid buttons - ensure they don't exceed max */}
            <div className="flex gap-2">
              {[minimumBid, minimumBid + 100, minimumBid + 500]
                .filter(amount => !maxBid || amount <= maxBid)
                .slice(0, 3)
                .map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBidAmount(amount.toString())}
                  className="flex-1 py-2 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            <Button 
              onClick={handlePlaceBid} 
              isLoading={isLoading} 
              className="w-full"
              size="lg"
            >
              Place Bid
            </Button>
          </div>

          {/* Buy Now */}
          {auction.buyNowPrice && !auction.buyNowUsed && auction.currentBid < auction.buyNowPrice && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <Button 
                variant="outline" 
                onClick={handleBuyNow}
                isLoading={isLoading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Buy Now for {formatCurrency(auction.buyNowPrice)}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Buyer's premium notice */}
      <p className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
        A {auction.buyersPremium}% buyer's premium will be added to the final bid
      </p>
    </div>
  );
}
