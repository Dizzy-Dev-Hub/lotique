import { IsString, IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  auctionId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class BidResponseDto {
  success: boolean;
  message: string;
  bid?: {
    id: string;
    amount: number;
    bidderDisplayName: string;
    timestamp: Date;
  };
  auction?: {
    currentBid: number;
    endsAt: Date;
    antiSnipeTriggered: boolean;
  };
}
