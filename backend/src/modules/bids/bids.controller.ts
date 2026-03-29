import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlaceBidDto } from './dto/bid.dto';
import type { UserDocument } from '../../schemas/user.schema';

@ApiTags('Bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bid' })
  async placeBid(
    @Body() dto: PlaceBidDto,
    @CurrentUser() user: UserDocument,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    const result = await this.bidsService.placeBid(
      user._id.toString(),
      dto,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Bid placed successfully',
      bid: {
        id: result.bid._id,
        amount: result.bid.amount,
        bidderDisplayName: result.bid.bidderDisplayName,
        timestamp: result.bid.createdAt,
      },
      auction: {
        currentBid: result.auction.currentBid,
        endsAt: result.auction.endsAt,
        antiSnipeTriggered: result.antiSnipeTriggered,
        totalBids: result.auction.totalBids,
      },
    };
  }

  @Get('auction/:auctionId')
  @ApiOperation({ summary: 'Get bid history for an auction' })
  async getBidHistory(
    @Param('auctionId') auctionId: string,
    @Query('limit') limit?: number,
  ) {
    return this.bidsService.getBidHistory(auctionId, limit);
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bid history' })
  async getMyBids(
    @CurrentUser() user: UserDocument,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bidsService.getUserBids(user._id.toString(), page, limit);
  }

  @Get('my-winning')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user winning/won bids' })
  async getMyWinningBids(@CurrentUser() user: UserDocument) {
    return this.bidsService.getUserWinningBids(user._id.toString());
  }
}
