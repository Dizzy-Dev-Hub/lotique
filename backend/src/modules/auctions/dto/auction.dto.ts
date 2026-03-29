import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AuctionStatus,
  AuctionVisibility,
} from '../../../schemas/auction.schema';

export class ConditionReportDto {
  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defects?: string[];

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsBoolean()
  authenticityVerified?: boolean;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  appraiserName?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

export class ShippingInfoDto {
  @IsNumber()
  @Min(0)
  domesticCost: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  internationalCost?: number;

  @IsOptional()
  @IsString()
  estimatedDays?: string;

  @IsOptional()
  @IsString()
  shippingNotes?: string;

  @IsOptional()
  @IsBoolean()
  insured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceCost?: number;
}

export class CreateAuctionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionReportDto)
  conditionReport?: ConditionReportDto;

  @IsNumber()
  @Min(1)
  startingBid: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyNowPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBidIncrement?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositRequired?: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  antiSnipeMinutes?: number;

  @IsOptional()
  @IsEnum(AuctionVisibility)
  visibility?: AuctionVisibility;

  @IsOptional()
  @IsString()
  accessPassword?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shipping?: ShippingInfoDto;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateAuctionDto extends CreateAuctionDto {
  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;
}

export class AuctionQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string; // e.g., "endsAt:asc", "currentBid:desc"
}

export class PrivateAuctionAccessDto {
  @IsString()
  password: string;
}
