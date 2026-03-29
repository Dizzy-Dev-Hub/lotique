import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Auction,
  AuctionDocument,
  AuctionStatus,
  AuctionVisibility,
} from '../../schemas/auction.schema';
import {
  CreateAuctionDto,
  UpdateAuctionDto,
  AuctionQueryDto,
} from './dto/auction.dto';
import { BidsGateway } from '../bids/bids.gateway';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectModel(Auction.name) private auctionModel: Model<AuctionDocument>,
    private bidsGateway: BidsGateway,
  ) {}

  async create(createDto: CreateAuctionDto): Promise<AuctionDocument> {
    const auction = new this.auctionModel({
      ...createDto,
      currentBid: 0,
      totalBids: 0,
      status: AuctionStatus.DRAFT,
      originalEndsAt: createDto.endsAt,
    });
    return auction.save();
  }

  async findAll(
    query: AuctionQueryDto,
  ): Promise<{
    auctions: AuctionDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      featured,
      search,
      sort,
    } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Only show public auctions by default (for public API)
    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Parse sort parameter
    let sortObj: any = { endsAt: 1 }; // Default: ending soon first
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'desc' ? -1 : 1 };
    }

    const [auctions, total] = await Promise.all([
      this.auctionModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auctionModel.countDocuments(filter),
    ]);

    return {
      auctions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findPublicLive(
    query: AuctionQueryDto,
  ): Promise<{
    auctions: AuctionDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    return this.findAll({
      ...query,
      status: AuctionStatus.LIVE,
    });
  }

  async findById(id: string): Promise<AuctionDocument> {
    const auction = await this.auctionModel.findById(id).exec();
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  async findByIdPublic(id: string, userId?: string): Promise<AuctionDocument> {
    const auction = await this.findById(id);

    // Check if private auction
    if (auction.visibility === AuctionVisibility.PRIVATE) {
      if (!userId) {
        throw new ForbiddenException('This is a private auction');
      }
      // Check if user is approved
      const isApproved = auction.approvedBidders.some(
        (bidderId) => bidderId.toString() === userId,
      );
      if (!isApproved) {
        throw new ForbiddenException('You do not have access to this auction');
      }
    }

    return auction;
  }

  async update(
    id: string,
    updateDto: UpdateAuctionDto,
  ): Promise<AuctionDocument> {
    const auction = await this.auctionModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { new: true },
    );
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  async delete(id: string): Promise<void> {
    const auction = await this.auctionModel.findById(id);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status === AuctionStatus.LIVE && auction.totalBids > 0) {
      throw new BadRequestException('Cannot delete live auction with bids');
    }

    await this.auctionModel.findByIdAndDelete(id);
  }

  async publishAuction(id: string): Promise<AuctionDocument> {
    const auction = await this.findById(id);

    if (auction.status !== AuctionStatus.DRAFT) {
      throw new BadRequestException('Only draft auctions can be published');
    }

    const now = new Date();
    const startsAt = new Date(auction.startsAt);

    const newStatus =
      startsAt <= now ? AuctionStatus.LIVE : AuctionStatus.SCHEDULED;

    auction.status = newStatus;
    return auction.save();
  }

  async startScheduledAuctions(): Promise<number> {
    const now = new Date();
    const result = await this.auctionModel.updateMany(
      {
        status: AuctionStatus.SCHEDULED,
        startsAt: { $lte: now },
      },
      { $set: { status: AuctionStatus.LIVE } },
    );
    return result.modifiedCount;
  }

  async endExpiredAuctions(): Promise<number> {
    const now = new Date();
    const expiredAuctions = await this.auctionModel.find({
      status: AuctionStatus.LIVE,
      endsAt: { $lte: now },
    });

    let count = 0;
    for (const auction of expiredAuctions) {
      await this.closeAuction(auction._id.toString());
      count++;
    }
    return count;
  }

  async closeAuction(id: string): Promise<AuctionDocument> {
    const auction = await this.findById(id);

    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException('Only live auctions can be closed');
    }

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
    }

    auction.status = newStatus;
    const savedAuction = await auction.save();

    // Notify via WebSocket
    this.bidsGateway.notifyAuctionEnded(auction._id.toString(), {
      status: newStatus,
      winnerId: auction.currentWinnerId?.toString(),
      finalBid: auction.currentBid,
      reserveMet: auction.reserveMet,
    });

    return savedAuction;
  }

  async updateCurrentBid(
    auctionId: string,
    amount: number,
    winnerId: Types.ObjectId,
    triggeredAntiSnipe: boolean,
  ): Promise<AuctionDocument> {
    const auction = await this.findById(auctionId);

    const updateData: any = {
      currentBid: amount,
      currentWinnerId: winnerId,
      $inc: { totalBids: 1 },
    };

    // Check reserve
    if (auction.reservePrice && amount >= auction.reservePrice) {
      updateData.reserveMet = true;
    }

    // Anti-snipe extension
    if (triggeredAntiSnipe) {
      const newEndTime = new Date(
        Date.now() + auction.antiSnipeMinutes * 60 * 1000,
      );
      updateData.endsAt = newEndTime;
    }

    const updated = await this.auctionModel.findByIdAndUpdate(
      auctionId,
      updateData,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Auction not found');
    }
    return updated;
  }

  async processBuyNow(
    id: string,
    userId: Types.ObjectId,
  ): Promise<AuctionDocument> {
    const auction = await this.findById(id);

    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException('Auction is not active');
    }

    if (!auction.buyNowPrice) {
      throw new BadRequestException('Buy Now not available for this auction');
    }

    if (auction.buyNowUsed) {
      throw new BadRequestException('Buy Now already used');
    }

    // If current bid is >= buy now price, buy now is no longer available
    if (auction.currentBid >= auction.buyNowPrice) {
      throw new BadRequestException(
        'Buy Now no longer available - current bid exceeds Buy Now price',
      );
    }

    auction.currentBid = auction.buyNowPrice;
    auction.currentWinnerId = userId;
    auction.status = AuctionStatus.SOLD;
    auction.buyNowUsed = true;
    auction.reserveMet = true;

    const savedAuction = await auction.save();

    // Notify via WebSocket
    this.bidsGateway.notifyBuyNow(auction._id.toString(), {
      buyerId: userId.toString(),
      price: auction.buyNowPrice,
    });

    return savedAuction;
  }

  async verifyPrivateAccess(
    auctionId: string,
    password: string,
  ): Promise<boolean> {
    const auction = await this.findById(auctionId);

    if (auction.visibility !== AuctionVisibility.PRIVATE) {
      return true; // Public auction
    }

    return auction.accessPassword === password;
  }

  async addApprovedBidder(
    auctionId: string,
    userId: string,
  ): Promise<AuctionDocument> {
    const auction = await this.auctionModel.findByIdAndUpdate(
      auctionId,
      { $addToSet: { approvedBidders: new Types.ObjectId(userId) } },
      { new: true },
    );
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  async acceptHighBid(id: string): Promise<AuctionDocument> {
    const auction = await this.findById(id);

    if (auction.status !== AuctionStatus.ENDED) {
      throw new BadRequestException(
        'Can only accept bid on ended auctions with unmet reserve',
      );
    }

    if (!auction.currentWinnerId) {
      throw new BadRequestException('No bids to accept');
    }

    auction.status = AuctionStatus.SOLD;
    auction.reserveMet = true;

    return auction.save();
  }

  async getCategories(): Promise<string[]> {
    return this.auctionModel.distinct('category');
  }

  async getFeatured(): Promise<AuctionDocument[]> {
    return this.auctionModel
      .find({
        featured: true,
        status: AuctionStatus.LIVE,
      })
      .limit(6)
      .exec();
  }

  async getEndingSoon(limit = 5): Promise<AuctionDocument[]> {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return this.auctionModel
      .find({
        status: AuctionStatus.LIVE,
        endsAt: { $gte: now, $lte: twoHoursFromNow },
      })
      .sort({ endsAt: 1 })
      .limit(limit)
      .exec();
  }

  async calculateLandedPrice(
    auctionId: string,
    isInternational: boolean,
  ): Promise<{
    hammer: number;
    premium: number;
    shipping: number;
    insurance: number;
    total: number;
  }> {
    const auction = await this.findById(auctionId);

    const hammer = auction.currentBid || auction.startingBid;
    const premium = hammer * (auction.buyersPremium / 100);
    const shipping = isInternational
      ? auction.shipping?.internationalCost || 0
      : auction.shipping?.domesticCost || 0;
    const insurance = auction.shipping?.insuranceCost || 0;

    return {
      hammer,
      premium: Math.round(premium * 100) / 100,
      shipping,
      insurance,
      total: Math.round((hammer + premium + shipping + insurance) * 100) / 100,
    };
  }
}
