// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "admin" | "bidder";
  status: "pending" | "active" | "verified" | "banned";
  reputationScore: number;
  totalWins: number;
  paymentsCompleted: number;
  avgPaymentTimeMinutes: number;
  bidderNumber?: number;
  displayName: string;
  walletBalance: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Auction types
export interface ConditionReport {
  summary: string;
  detailedDescription?: string;
  defects?: string[];
  grade?: string;
  authenticityVerified?: boolean;
  certificateNumber?: string;
  appraiserName?: string;
  appraisalDate?: string;
  pdfUrl?: string;
}

export interface ShippingInfo {
  domesticCost: number;
  internationalCost?: number;
  estimatedDays?: string;
  shippingNotes?: string;
  insured?: boolean;
  insuranceCost?: number;
}

export type AuctionStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "ended"
  | "closed"
  | "sold"
  | "unsold"
  | "cancelled";
export type AuctionVisibility = "public" | "private";

export interface Auction {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  brand?: string;
  model?: string;
  year?: number;
  specifications?: Record<string, any>;
  images: string[];
  videoUrl?: string;
  conditionReport?: ConditionReport;
  startingBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currentBid: number;
  currentWinnerId?: string;
  totalBids: number;
  buyersPremium: number;
  startsAt: string;
  endsAt: string;
  originalEndsAt?: string;
  antiSnipeMinutes: number;
  antiSnipeThresholdMinutes: number;
  status: AuctionStatus;
  visibility: AuctionVisibility;
  shipping?: ShippingInfo;
  lotNumber?: string;
  featured: boolean;
  reserveMet: boolean;
  buyNowUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionListResponse {
  auctions: Auction[];
  total: number;
  page: number;
  pages: number;
}

// Bid types
export interface Bid {
  _id: string;
  auctionId: string;
  userId: string;
  amount: number;
  status: "active" | "outbid" | "winning" | "won" | "cancelled";
  isWinning?: boolean;
  bidderNumber: number;
  bidderDisplayName: string;
  triggeredAntiSnipe: boolean;
  createdAt: string;
}

export interface PlaceBidResponse {
  success: boolean;
  message: string;
  bid?: {
    id: string;
    amount: number;
    bidderDisplayName: string;
    timestamp: string;
  };
  auction?: {
    currentBid: number;
    endsAt: string;
    antiSnipeTriggered: boolean;
    totalBids: number;
  };
}

// Price calculator
export interface LandedPrice {
  hammer: number;
  premium: number;
  shipping: number;
  insurance: number;
  total: number;
}

// WebSocket events
export interface NewBidEvent {
  bidId: string;
  amount: number;
  bidderDisplayName: string;
  timestamp: string;
  currentBid: number;
  totalBids: number;
  endsAt: string;
  antiSnipeTriggered: boolean;
}

export interface OutbidEvent {
  auctionId: string;
  auctionTitle: string;
  newBid: number;
  yourBid: number;
}

export interface AuctionEndedEvent {
  status: AuctionStatus;
  winnerId?: string;
  finalBid: number;
  reserveMet: boolean;
}

// API Query params
export interface AuctionQueryParams {
  page?: number;
  limit?: number;
  status?: AuctionStatus;
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
}
