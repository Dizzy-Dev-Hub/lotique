import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bid, BidDocument, BidStatus } from '../../schemas/bid.schema';
import {
  Auction,
  AuctionDocument,
  AuctionStatus,
  AuctionVisibility,
} from '../../schemas/auction.schema';
import { User, UserDocument, UserStatus } from '../../schemas/user.schema';
import { PlaceBidDto } from './dto/bid.dto';
import { BidsGateway } from './bids.gateway';

export interface PlaceBidResult {
  bid: BidDocument;
  auction: AuctionDocument;
  antiSnipeTriggered: boolean;
  previousWinnerId?: string;
}

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    @InjectModel(Auction.name) private auctionModel: Model<AuctionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bidsGateway: BidsGateway,
  ) {}

  async placeBid(
    userId: string,
    dto: PlaceBidDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PlaceBidResult> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Your account has been suspended');
    }

    const auction = await this.auctionModel.findById(dto.auctionId);
    if (!auction) {
      throw new BadRequestException('Auction not found');
    }

    // Validate auction is live
    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException('Auction is not active');
    }

    // Check if auction has ended
    if (new Date() > new Date(auction.endsAt)) {
      throw new BadRequestException('Auction has ended');
    }

    // Check private auction access
    if (auction.visibility === AuctionVisibility.PRIVATE) {
      const hasAccess = auction.approvedBidders.some(
        (bidderId) => bidderId.toString() === userId,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this private auction',
        );
      }
    }

    // Check deposit requirement
    if (auction.depositRequired > 0) {
      if (user.walletBalance < auction.depositRequired) {
        throw new BadRequestException(
          `This auction requires a deposit of $${auction.depositRequired}. Please add funds to your wallet.`,
        );
      }
    }

    // Validate bid amount
    const minimumBid = this.calculateMinimumBid(auction);
    if (dto.amount < minimumBid) {
      throw new BadRequestException(
        `Minimum bid is $${minimumBid.toLocaleString()}`,
      );
    }

    // Check if Buy Now is still available and if bid exceeds it
    if (auction.buyNowPrice && dto.amount >= auction.buyNowPrice) {
      throw new BadRequestException(
        `Your bid exceeds the Buy Now price. Use Buy Now instead or bid less than $${auction.buyNowPrice.toLocaleString()}`,
      );
    }

    // Get previous winner for notification
    const previousWinnerId = auction.currentWinnerId?.toString();

    // Calculate anti-snipe
    const antiSnipeTriggered = this.checkAntiSnipe(auction);
    let newEndTime: Date | undefined;

    if (antiSnipeTriggered) {
      newEndTime = new Date(Date.now() + auction.antiSnipeMinutes * 60 * 1000);
    }

    // Create the bid
    const bid = new this.bidModel({
      auctionId: new Types.ObjectId(dto.auctionId),
      userId: new Types.ObjectId(userId),
      amount: dto.amount,
      status: BidStatus.WINNING,
      bidderNumber: user.bidderNumber,
      bidderDisplayName: `Bidder #${user.bidderNumber?.toString().padStart(3, '0')}`,
      ipAddress,
      userAgent,
      triggeredAntiSnipe: antiSnipeTriggered,
      previousEndTime: antiSnipeTriggered ? auction.endsAt : undefined,
      newEndTime,
    });

    await bid.save();

    // Mark previous winning bid as outbid
    if (auction.currentWinnerId) {
      await this.bidModel.updateMany(
        { auctionId: auction._id, status: BidStatus.WINNING },
        { $set: { status: BidStatus.OUTBID } },
      );
    }

    // Update auction
    const updateData: any = {
      currentBid: dto.amount,
      currentWinnerId: new Types.ObjectId(userId),
      $inc: { totalBids: 1 },
    };

    if (auction.reservePrice && dto.amount >= auction.reservePrice) {
      updateData.reserveMet = true;
    }

    if (antiSnipeTriggered && newEndTime) {
      updateData.endsAt = newEndTime;
    }

    const updatedAuction = await this.auctionModel.findByIdAndUpdate(
      dto.auctionId,
      updateData,
      { new: true },
    );

    if (!updatedAuction) {
      throw new BadRequestException('Failed to update auction');
    }

    // Broadcast via WebSocket
    this.bidsGateway.broadcastBid(dto.auctionId, {
      bidId: bid._id.toString(),
      amount: dto.amount,
      bidderDisplayName: bid.bidderDisplayName,
      timestamp: bid.createdAt,
      currentBid: dto.amount,
      totalBids: updatedAuction.totalBids,
      endsAt: updatedAuction.endsAt,
      antiSnipeTriggered,
    });

    // Notify outbid user
    if (previousWinnerId && previousWinnerId !== userId) {
      this.bidsGateway.notifyOutbid(previousWinnerId, {
        auctionId: dto.auctionId,
        auctionTitle: auction.title,
        newBid: dto.amount,
        yourBid: auction.currentBid,
      });
    }

    return {
      bid,
      auction: updatedAuction,
      antiSnipeTriggered,
      previousWinnerId,
    };
  }

  private calculateMinimumBid(auction: AuctionDocument): number {
    if (auction.totalBids === 0) {
      return auction.startingBid;
    }

    const increment =
      auction.minimumBidIncrement ||
      this.getDefaultIncrement(auction.currentBid);
    return auction.currentBid + increment;
  }

  private getDefaultIncrement(currentBid: number): number {
    // Industry-standard bid increments
    if (currentBid < 100) return 5;
    if (currentBid < 500) return 10;
    if (currentBid < 1000) return 25;
    if (currentBid < 5000) return 50;
    if (currentBid < 10000) return 100;
    if (currentBid < 25000) return 250;
    if (currentBid < 50000) return 500;
    if (currentBid < 100000) return 1000;
    return 2500;
  }

  private checkAntiSnipe(auction: AuctionDocument): boolean {
    const now = Date.now();
    const endsAt = new Date(auction.endsAt).getTime();
    const thresholdMs = auction.antiSnipeThresholdMinutes * 60 * 1000;

    return endsAt - now <= thresholdMs;
  }

  async getBidHistory(auctionId: string, limit = 50): Promise<BidDocument[]> {
    return this.bidModel
      .find({ auctionId: new Types.ObjectId(auctionId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('amount bidderDisplayName createdAt triggeredAntiSnipe')
      .exec();
  }

  async getUserBids(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ bids: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      this.bidModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('auctionId', 'title images status currentBid endsAt')
        .exec(),
      this.bidModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return { bids, total };
  }

  async getUserWinningBids(userId: string): Promise<BidDocument[]> {
    return this.bidModel
      .find({
        userId: new Types.ObjectId(userId),
        status: { $in: [BidStatus.WINNING, BidStatus.WON] },
      })
      .populate('auctionId', 'title images status currentBid endsAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  async markBidsAsWon(auctionId: string): Promise<void> {
    await this.bidModel.updateMany(
      { auctionId: new Types.ObjectId(auctionId), status: BidStatus.WINNING },
      { $set: { status: BidStatus.WON } },
    );
  }

  async getAuctionBidders(auctionId: string): Promise<string[]> {
    const bids = await this.bidModel
      .find({ auctionId: new Types.ObjectId(auctionId) })
      .distinct('userId');
    return bids.map((id) => id.toString());
  }

  async getTopBidders(auctionId: string, limit = 3): Promise<any[]> {
    return this.bidModel.aggregate([
      { $match: { auctionId: new Types.ObjectId(auctionId) } },
      { $sort: { amount: -1 } },
      {
        $group: {
          _id: '$userId',
          maxBid: { $max: '$amount' },
          displayName: { $first: '$bidderDisplayName' },
        },
      },
      { $sort: { maxBid: -1 } },
      { $limit: limit },
    ]);
  }
}
