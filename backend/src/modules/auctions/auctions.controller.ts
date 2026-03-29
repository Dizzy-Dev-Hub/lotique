import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateAuctionDto,
  UpdateAuctionDto,
  AuctionQueryDto,
  PrivateAuctionAccessDto,
} from './dto/auction.dto';
import type { UserDocument } from '../../schemas/user.schema';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  // Public routes
  @Get('live')
  @ApiOperation({ summary: 'Get all live auctions' })
  async getLiveAuctions(@Query() query: AuctionQueryDto) {
    return this.auctionsService.findPublicLive(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured auctions' })
  async getFeatured() {
    return this.auctionsService.getFeatured();
  }

  @Get('ending-soon')
  @ApiOperation({ summary: 'Get auctions ending soon' })
  async getEndingSoon(@Query('limit') limit?: number) {
    return this.auctionsService.getEndingSoon(limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all auction categories' })
  async getCategories() {
    return this.auctionsService.getCategories();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get auction by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: UserDocument) {
    return this.auctionsService.findByIdPublic(id, user?._id?.toString());
  }

  @Get(':id/price-calculator')
  @ApiOperation({ summary: 'Calculate landed price for an auction' })
  async calculatePrice(
    @Param('id') id: string,
    @Query('international') international?: boolean,
  ) {
    return this.auctionsService.calculateLandedPrice(
      id,
      international || false,
    );
  }

  @Post(':id/access')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request access to private auction' })
  async requestAccess(
    @Param('id') id: string,
    @Body() accessDto: PrivateAuctionAccessDto,
    @CurrentUser() user: UserDocument,
  ) {
    const isValid = await this.auctionsService.verifyPrivateAccess(
      id,
      accessDto.password,
    );
    if (isValid) {
      await this.auctionsService.addApprovedBidder(id, user._id.toString());
      return { message: 'Access granted' };
    }
    return { message: 'Invalid password' };
  }

  // Admin routes
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all auctions (admin)' })
  async findAll(@Query() query: AuctionQueryDto) {
    return this.auctionsService.findAll(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get auction by ID for admin (no restrictions)' })
  async findOneAdmin(@Param('id') id: string) {
    return this.auctionsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new auction (admin)' })
  async create(@Body() createDto: CreateAuctionDto) {
    return this.auctionsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update auction (admin)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateAuctionDto) {
    return this.auctionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete auction (admin)' })
  async delete(@Param('id') id: string) {
    await this.auctionsService.delete(id);
    return { message: 'Auction deleted' };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish draft auction (admin)' })
  async publish(@Param('id') id: string) {
    return this.auctionsService.publishAuction(id);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close auction manually (admin)' })
  async close(@Param('id') id: string) {
    return this.auctionsService.closeAuction(id);
  }

  @Post(':id/accept-bid')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept current high bid when reserve not met (admin)',
  })
  async acceptBid(@Param('id') id: string) {
    return this.auctionsService.acceptHighBid(id);
  }

  @Post(':id/buy-now')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute Buy Now on an auction' })
  async buyNow(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    const auction = await this.auctionsService.processBuyNow(id, user._id);
    return {
      message: 'Buy Now successful',
      auction,
      price: auction.currentBid,
    };
  }
}
