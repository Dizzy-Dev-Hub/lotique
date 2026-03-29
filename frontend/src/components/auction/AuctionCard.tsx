'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCountdown } from '@/hooks';
import type { Auction } from '@/types';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { days, hours, minutes, seconds, isEnded } = useCountdown({
    endDate: auction.endsAt,
  });

  const isSold = auction.status === 'sold';
  const isClosed = auction.status === 'closed';
  const isLive = auction.status === 'live';
  const isEndingSoon = !isEnded && !isSold && !isClosed && days === 0 && hours < 2;
  const hasImage = auction.images && auction.images.length > 0;

  return (
    <Link href={`/auctions/${auction._id}`}>
      <Card hover className={`h-full flex flex-col ${isSold || isClosed ? 'opacity-75' : ''}`}>
        {/* Image */}
        <div className="relative aspect-square bg-[var(--color-bg-tertiary)]">
          {hasImage ? (
            <Image
              src={auction.images[0]}
              alt={auction.title}
              fill
              className={`object-cover ${isSold || isClosed ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
              No Image
            </div>
          )}

          {/* SOLD overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-[var(--color-primary)] text-black px-6 py-2 rounded-lg transform -rotate-12">
                <span className="text-2xl font-bold tracking-wider">SOLD</span>
              </div>
            </div>
          )}

          {/* CLOSED overlay */}
          {isClosed && !isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-red-600 text-white px-6 py-2 rounded-lg">
                <span className="text-xl font-bold tracking-wider">CLOSED</span>
              </div>
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {auction.featured && !isSold && !isClosed && (
              <Badge variant="gold" size="sm">Featured</Badge>
            )}
            {isSold && (
              <Badge variant="gold" size="sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sold
              </Badge>
            )}
            {isClosed && !isSold && (
              <Badge variant="error" size="sm">
                <XCircle className="h-3 w-3 mr-1" />
                Unsold
              </Badge>
            )}
            {isLive && (
              <Badge variant="success" size="sm" pulse>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Live
              </Badge>
            )}
            {isEndingSoon && (
              <Badge variant="warning" size="sm">Ending Soon</Badge>
            )}
          </div>

          {/* Lot number */}
          {auction.lotNumber && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" size="sm">Lot {auction.lotNumber}</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[var(--color-primary)] uppercase tracking-wide">
              {auction.category}
            </span>
            {auction.brand && (
              <>
                <span className="text-[var(--color-text-muted)]">•</span>
                <span className="text-xs text-[var(--color-text-muted)]">{auction.brand}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
            {auction.title}
          </h3>

          {/* Current bid */}
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {isSold ? 'Sold For' : isClosed ? 'Final Bid' : auction.totalBids > 0 ? 'Current Bid' : 'Starting Bid'}
                </p>
                <p className={`text-xl font-bold ${isSold ? 'text-[var(--color-primary)]' : isClosed ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-primary)]'}`}>
                  {formatCurrency(auction.totalBids > 0 ? auction.currentBid : auction.startingBid)}
                </p>
              </div>
              {auction.buyNowPrice && !auction.buyNowUsed && !isSold && !isClosed && isLive && (
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">Buy Now</p>
                  <p className="text-lg font-semibold text-[var(--color-text-secondary)]">
                    {formatCurrency(auction.buyNowPrice)}
                  </p>
                </div>
              )}
            </div>

            {/* Time & bids */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-[var(--color-text-muted)]">
                <Clock className="h-4 w-4 mr-1" />
                {isSold ? (
                  <span className="text-[var(--color-primary)]">Sold</span>
                ) : isClosed || isEnded ? (
                  <span className="text-[var(--color-error)]">Ended</span>
                ) : (
                  <span className={isEndingSoon ? 'text-[var(--color-warning)]' : ''}>
                    {days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m ${seconds}s`}
                  </span>
                )}
              </div>
              <div className="flex items-center text-[var(--color-text-muted)]">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
