'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { auctionsApi, bidsApi } from '@/services/api';
import { BidPanel } from '@/components/auction';
import { Button, Badge, Card } from '@/components/ui';
import { useAuctionSocket } from '@/hooks';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Download, 
  Play,
  Shield,
  Truck,
  FileText,
  Clock
} from 'lucide-react';
import type { Auction, Bid, NewBidEvent, LandedPrice } from '@/types';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params.id as string;
  const { user } = useAuthStore();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [landedPrice, setLandedPrice] = useState<LandedPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInternational, setIsInternational] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuction();
    loadBids();
  }, [auctionId]);

  useEffect(() => {
    if (auction) {
      loadLandedPrice();
    }
  }, [auction, isInternational]);

  const loadAuction = async () => {
    try {
      // Try admin endpoint first if user is admin, fall back to public
      let data: Auction;
      if (user?.role === 'admin') {
        try {
          data = await auctionsApi.getByIdAdmin(auctionId);
        } catch {
          data = await auctionsApi.getById(auctionId);
        }
      } else {
        data = await auctionsApi.getById(auctionId);
      }
      setAuction(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load auction:', err);
      if (err.response?.status === 403) {
        setError('This auction is private. You do not have access.');
      } else if (err.response?.status === 404) {
        setError('Auction not found.');
      } else {
        setError('Failed to load auction.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const data = await bidsApi.getHistory(auctionId, 20);
      setBids(data);
    } catch (error) {
      console.error('Failed to load bids:', error);
    }
  };

  const loadLandedPrice = async () => {
    try {
      const data = await auctionsApi.calculatePrice(auctionId, isInternational);
      setLandedPrice(data);
    } catch (error) {
      console.error('Failed to load landed price:', error);
    }
  };

  const handleNewBid = useCallback((data: NewBidEvent) => {
    setAuction(prev => prev ? {
      ...prev,
      currentBid: data.currentBid,
      totalBids: data.totalBids,
      endsAt: data.endsAt,
    } : null);
    
    // Add new bid to history
    setBids(prev => [{
      _id: data.bidId,
      auctionId,
      userId: '',
      amount: data.amount,
      status: 'winning',
      bidderNumber: 0,
      bidderDisplayName: data.bidderDisplayName,
      triggeredAntiSnipe: data.antiSnipeTriggered,
      createdAt: data.timestamp,
    }, ...prev]);
  }, [auctionId]);

  useAuctionSocket({
    auctionId,
    onNewBid: handleNewBid,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="aspect-video bg-[var(--color-bg-tertiary)] rounded-xl" />
          <div className="h-8 bg-[var(--color-bg-tertiary)] rounded w-1/2" />
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full" />
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {error || 'Auction not found'}
        </h1>
        {error && (
          <p className="mt-4 text-[var(--color-text-muted)]">
            Please check the auction link or contact support.
          </p>
        )}
      </div>
    );
  }

  const images = auction.images.length > 0 ? auction.images : ['/placeholder.jpg'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg-tertiary)]">
            <div className="aspect-square relative">
              <Image
                src={images[currentImageIndex]}
                alt={auction.title}
                fill
                className="object-contain"
              />
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Video button */}
              {auction.videoUrl && (
                <a
                  href={auction.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-black/70 flex items-center gap-2 text-white hover:bg-black/90 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Watch Video
                </a>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      i === currentImageIndex ? 'border-[var(--color-primary)]' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="gold">{auction.category}</Badge>
                {auction.brand && <Badge variant="outline">{auction.brand}</Badge>}
                {auction.lotNumber && <Badge variant="outline">Lot {auction.lotNumber}</Badge>}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)]">
                {auction.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <p className="text-[var(--color-text-secondary)] whitespace-pre-line">
              {auction.description}
            </p>
          </div>

          {/* Specifications */}
          {auction.specifications && Object.keys(auction.specifications).length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(auction.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-[var(--color-text-muted)]">{key}</dt>
                      <dd className="text-[var(--color-text-primary)]">{String(value)}</dd>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Condition Report */}
          {auction.conditionReport && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Condition Report</h3>
                  {auction.conditionReport.pdfUrl && (
                    <a href={auction.conditionReport.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  )}
                </div>
                <div className="space-y-4">
                  {auction.conditionReport.grade && (
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">{auction.conditionReport.grade}</Badge>
                      {auction.conditionReport.authenticityVerified && (
                        <Badge variant="success">
                          <Shield className="h-3 w-3 mr-1" />
                          Authenticated
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-[var(--color-text-secondary)]">{auction.conditionReport.summary}</p>
                  {auction.conditionReport.detailedDescription && (
                    <p className="text-[var(--color-text-muted)] text-sm">{auction.conditionReport.detailedDescription}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Bid History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Bid History ({auction.totalBids} bids)
              </h3>
              {bids.length === 0 ? (
                <p className="text-[var(--color-text-muted)]">No bids yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  {bids.slice(0, 10).map((bid, i) => (
                    <div key={bid._id} className={`flex items-center justify-between py-2 ${i === 0 ? 'bid-flash' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--color-text-secondary)]">{bid.bidderDisplayName}</span>
                        {bid.triggeredAntiSnipe && (
                          <Badge variant="warning" size="sm">
                            <Clock className="h-3 w-3 mr-1" />
                            Extended
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${i === 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                          {formatCurrency(bid.amount)}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] ml-2">
                          {formatDate(bid.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Bid Panel & Price Calculator */}
        <div className="space-y-6">
          <BidPanel auction={auction} onBidPlaced={loadBids} />

          {/* Landed Price Calculator */}
          {landedPrice && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Total Cost Calculator
                </h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={isInternational}
                      onChange={(e) => setIsInternational(e.target.checked)}
                      className="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
                    />
                    International shipping
                  </label>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Hammer Price</span>
                    <span className="text-[var(--color-text-primary)]">{formatCurrency(landedPrice.hammer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Buyer's Premium ({auction.buyersPremium}%)</span>
                    <span className="text-[var(--color-text-primary)]">{formatCurrency(landedPrice.premium)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Shipping</span>
                    <span className="text-[var(--color-text-primary)]">{formatCurrency(landedPrice.shipping)}</span>
                  </div>
                  {landedPrice.insurance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Insurance</span>
                      <span className="text-[var(--color-text-primary)]">{formatCurrency(landedPrice.insurance)}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[var(--color-text-primary)]">Total</span>
                      <span className="text-[var(--color-primary)]">{formatCurrency(landedPrice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Trust badges */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Authenticity Guaranteed</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Verified by certified experts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Insured Shipping</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Worldwide delivery available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Full Documentation</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Condition reports & certificates</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
