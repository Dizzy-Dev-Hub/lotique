import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuctionDocument = Auction & Document;

export enum AuctionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  SOLD = 'sold',
  UNSOLD = 'unsold',
  CANCELLED = 'cancelled',
}

export enum AuctionVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Schema({ _id: false })
export class ConditionReport {
  @Prop()
  summary: string;

  @Prop()
  detailedDescription: string;

  @Prop({ type: [String], default: [] })
  defects: string[];

  @Prop()
  grade?: string; // e.g., "Excellent", "Very Good", "Good", "Fair"

  @Prop()
  authenticityVerified: boolean;

  @Prop()
  certificateNumber?: string;

  @Prop()
  appraiserName?: string;

  @Prop()
  appraisalDate?: Date;

  @Prop()
  pdfUrl?: string;
}

@Schema({ _id: false })
export class ShippingInfo {
  @Prop({ default: 0 })
  domesticCost: number;

  @Prop({ default: 0 })
  internationalCost: number;

  @Prop()
  estimatedDays?: string;

  @Prop()
  shippingNotes?: string;

  @Prop({ default: true })
  insured: boolean;

  @Prop({ default: 0 })
  insuranceCost: number;
}

@Schema({ timestamps: true })
export class Auction {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ trim: true })
  shortDescription?: string;

  // Category & details
  @Prop({ required: true })
  category: string; // "watches", "jewelry", "accessories"

  @Prop()
  brand?: string;

  @Prop()
  model?: string;

  @Prop()
  year?: number;

  @Prop({ type: Object })
  specifications?: Record<string, any>; // Flexible specs (case size, material, etc.)

  // Media
  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoUrl?: string; // YouTube/Vimeo embed URL

  @Prop({ type: ConditionReport })
  conditionReport?: ConditionReport;

  // Pricing
  @Prop({ required: true, min: 0 })
  startingBid: number;

  @Prop({ min: 0 })
  reservePrice?: number; // Hidden from bidders

  @Prop({ min: 0 })
  buyNowPrice?: number;

  @Prop({ default: 0 })
  currentBid: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  currentWinnerId?: Types.ObjectId;

  @Prop({ default: 0 })
  totalBids: number;

  @Prop({ default: 18 }) // 18% buyer's premium
  buyersPremium: number;

  // Timing
  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop()
  originalEndsAt?: Date; // Track original end time before anti-snipe extensions

  @Prop({ default: 2 })
  antiSnipeMinutes: number; // Extend auction by this many minutes if bid in final minutes

  @Prop({ default: 2 })
  antiSnipeThresholdMinutes: number; // Trigger anti-snipe if bid within this many minutes of end

  // Status & visibility
  @Prop({ type: String, enum: AuctionStatus, default: AuctionStatus.DRAFT })
  status: AuctionStatus;

  @Prop({
    type: String,
    enum: AuctionVisibility,
    default: AuctionVisibility.PUBLIC,
  })
  visibility: AuctionVisibility;

  @Prop()
  accessPassword?: string; // For private auctions

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  approvedBidders: Types.ObjectId[]; // For invite-only auctions

  // Minimum bid requirements
  @Prop({ default: 0 })
  minimumBidIncrement: number;

  @Prop({ default: 0 })
  depositRequired: number; // Require this deposit to bid

  // Shipping
  @Prop({ type: ShippingInfo })
  shipping?: ShippingInfo;

  // Lot information
  @Prop()
  lotNumber?: string;

  @Prop({ default: false })
  featured: boolean;

  // Flags
  @Prop({ default: false })
  reserveMet: boolean;

  @Prop({ default: false })
  buyNowUsed: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);

// Indexes
AuctionSchema.index({ status: 1, startsAt: 1 });
AuctionSchema.index({ status: 1, endsAt: 1 });
AuctionSchema.index({ category: 1, status: 1 });
AuctionSchema.index({ featured: 1, status: 1 });
AuctionSchema.index({ lotNumber: 1 });
AuctionSchema.index({ visibility: 1 });

// Virtual: is reserve met
AuctionSchema.virtual('isReserveMet').get(function () {
  if (!this.reservePrice) return true;
  return this.currentBid >= this.reservePrice;
});

// Virtual: time remaining in ms
AuctionSchema.virtual('timeRemaining').get(function () {
  if (this.status !== AuctionStatus.LIVE) return 0;
  return Math.max(0, new Date(this.endsAt).getTime() - Date.now());
});

// Virtual: calculate total price for winner
AuctionSchema.virtual('totalPrice').get(function () {
  const premium = this.currentBid * (this.buyersPremium / 100);
  const shipping = this.shipping?.domesticCost || 0;
  const insurance = this.shipping?.insuranceCost || 0;
  return this.currentBid + premium + shipping + insurance;
});
