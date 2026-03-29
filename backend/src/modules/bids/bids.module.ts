import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { BidsGateway } from './bids.gateway';
import { Bid, BidSchema } from '../../schemas/bid.schema';
import { Auction, AuctionSchema } from '../../schemas/auction.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bid.name, schema: BidSchema },
      { name: Auction.name, schema: AuctionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuctionsModule),
  ],
  controllers: [BidsController],
  providers: [BidsService, BidsGateway],
  exports: [BidsService, BidsGateway],
})
export class BidsModule {}
