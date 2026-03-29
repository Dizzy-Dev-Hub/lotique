import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum PaymentType {
  AUCTION_PAYMENT = 'auction_payment',
  BUY_NOW = 'buy_now',
  DEPOSIT = 'deposit',
  DEPOSIT_RELEASE = 'deposit_release',
  REFUND = 'refund',
}

@Schema({ timestamps: true })
export class Payment {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Auction' })
  auctionId?: Types.ObjectId;

  @Prop({ type: String, enum: PaymentType, required: true })
  type: PaymentType;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // Amounts
  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  hammerPrice: number; // The winning bid

  @Prop({ default: 0 })
  buyersPremium: number;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ default: 0 })
  insuranceCost: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  // Stripe
  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeChargeId?: string;

  @Prop()
  paymentMethod?: string; // card, apple_pay, google_pay

  @Prop()
  last4?: string; // Last 4 digits of card

  @Prop()
  cardBrand?: string; // visa, mastercard, etc.

  // Invoice
  @Prop()
  invoiceNumber?: string;

  @Prop()
  invoiceUrl?: string;

  // Timing
  @Prop()
  dueAt?: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  paymentTimeMinutes?: number; // How long did they take to pay?

  // Notes
  @Prop()
  notes?: string;

  @Prop()
  failureReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ auctionId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ invoiceNumber: 1 });
