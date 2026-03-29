import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Auction,
  AuctionDocument,
  AuctionStatus,
} from '../schemas/auction.schema';
import { BidsGateway } from '../modules/bids/bids.gateway';
import { BidsService } from '../modules/bids/bids.service';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(
    @InjectModel(Auction.name) private auctionModel: Model<AuctionDocument>,
    private bidsGateway: BidsGateway,
    private bidsService: BidsService,
  ) {}

  // Check every 10 seconds for auction status changes
  @Cron('*/10 * * * * *')
  async handleAuctionLifecycle() {
    const now = new Date();

    // Start scheduled auctions
    const startedCount = await this.startScheduledAuctions(now);
    if (startedCount > 0) {
      this.logger.log(`Started ${startedCount} scheduled auctions`);
    }

    // End expired auctions
    const endedCount = await this.endExpiredAuctions(now);
    if (endedCount > 0) {
      this.logger.log(`Ended ${endedCount} expired auctions`);
    }
  }

  private async startScheduledAuctions(now: Date): Promise<number> {
    const scheduledAuctions = await this.auctionModel.find({
      status: AuctionStatus.SCHEDULED,
      startsAt: { $lte: now },
    });

    for (const auction of scheduledAuctions) {
      auction.status = AuctionStatus.LIVE;
      await auction.save();

      // Notify watchers
      this.bidsGateway.server?.emit('auction-started', {
        auctionId: auction._id.toString(),
        title: auction.title,
      });
    }

    return scheduledAuctions.length;
  }

  private async endExpiredAuctions(now: Date): Promise<number> {
    const expiredAuctions = await this.auctionModel.find({
      status: AuctionStatus.LIVE,
      endsAt: { $lte: now },
    });

    for (const auction of expiredAuctions) {
      let newStatus: AuctionStatus;

      if (auction.totalBids === 0) {
        newStatus = AuctionStatus.UNSOLD;
      } else if (
        auction.reservePrice &&
        auction.currentBid < auction.reservePrice
      ) {
        newStatus = AuctionStatus.ENDED; // Reserve not met
        auction.reserveMet = false;
      } else {
        newStatus = AuctionStatus.SOLD;
        auction.reserveMet = true;

        // Mark winning bid
        await this.bidsService.markBidsAsWon(auction._id.toString());
      }

      auction.status = newStatus;
      await auction.save();

      // Notify via WebSocket
      this.bidsGateway.notifyAuctionEnded(auction._id.toString(), {
        status: newStatus,
        winnerId: auction.currentWinnerId?.toString(),
        finalBid: auction.currentBid,
        reserveMet: auction.reserveMet,
      });
    }

    return expiredAuctions.length;
  }

  // Daily cleanup job - run at 3 AM
  @Cron('0 3 * * *')
  async handleDailyCleanup() {
    this.logger.log('Running daily cleanup...');

    // Archive old completed auctions (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Could move to archive collection or mark as archived
    // For now, just log
    const oldAuctions = await this.auctionModel.countDocuments({
      status: {
        $in: [
          AuctionStatus.SOLD,
          AuctionStatus.UNSOLD,
          AuctionStatus.CANCELLED,
        ],
      },
      updatedAt: { $lt: ninetyDaysAgo },
    });

    this.logger.log(`Found ${oldAuctions} auctions older than 90 days`);
  }
}
