import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchlistDocument = Watchlist & Document;

@Schema({ timestamps: true })
export class Watchlist {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Auction', required: true })
  auctionId: Types.ObjectId;

  @Prop({ default: true })
  notifyOnOutbid: boolean;

  @Prop({ default: true })
  notifyBeforeEnd: boolean;

  @Prop({ default: 30 }) // minutes before end
  notifyMinutesBefore: number;

  @Prop({ default: false })
  endingSoonNotified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const WatchlistSchema = SchemaFactory.createForClass(Watchlist);

// Compound unique index - user can only watch an auction once
WatchlistSchema.index({ userId: 1, auctionId: 1 }, { unique: true });
WatchlistSchema.index({ auctionId: 1 });
