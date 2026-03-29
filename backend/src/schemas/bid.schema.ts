import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BidDocument = Bid & Document;

export enum BidStatus {
  ACTIVE = 'active',
  OUTBID = 'outbid',
  WINNING = 'winning',
  WON = 'won',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Bid {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Auction', required: true })
  auctionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: BidStatus, default: BidStatus.ACTIVE })
  status: BidStatus;

  // For anonymous display
  @Prop({ required: true })
  bidderNumber: number;

  @Prop()
  bidderDisplayName: string; // Cached: "Bidder #007"

  // Tracking
  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  // Auto-bid / max bid support (future feature)
  @Prop()
  maxBid?: number;

  @Prop({ default: false })
  isAutoBid: boolean;

  // Did this bid trigger anti-snipe?
  @Prop({ default: false })
  triggeredAntiSnipe: boolean;

  @Prop()
  previousEndTime?: Date;

  @Prop()
  newEndTime?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const BidSchema = SchemaFactory.createForClass(Bid);

// Indexes for performance
BidSchema.index({ auctionId: 1, createdAt: -1 });
BidSchema.index({ userId: 1, createdAt: -1 });
BidSchema.index({ auctionId: 1, amount: -1 });
BidSchema.index({ auctionId: 1, status: 1 });
