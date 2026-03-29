import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  BIDDER = 'bidder',
}

export enum UserStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  BANNED = 'banned',
}

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.BIDDER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  // Reputation system
  @Prop({ default: 0 })
  totalWins: number;

  @Prop({ default: 0 })
  paymentsCompleted: number;

  @Prop({ default: 0 })
  avgPaymentTimeMinutes: number;

  @Prop({ default: 5.0, min: 0, max: 5 })
  reputationScore: number;

  // Security
  @Prop()
  bannedReason?: string;

  @Prop()
  bannedAt?: Date;

  @Prop({ type: [String], default: [] })
  bannedIPs: string[];

  // Bidding
  @Prop({ default: 0 })
  walletBalance: number;

  @Prop()
  stripeCustomerId?: string;

  // Anonymization - assigned when they first bid
  @Prop()
  bidderNumber?: number;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIP?: string;

  // Virtual fields populated by timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ stripeCustomerId: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (anonymized)
UserSchema.virtual('displayName').get(function () {
  return this.bidderNumber
    ? `Bidder #${this.bidderNumber.toString().padStart(3, '0')}`
    : 'Anonymous';
});
