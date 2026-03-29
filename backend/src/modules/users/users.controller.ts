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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto, AdminUpdateUserDto, BanUserDto } from './dto/user.dto';
import type { UserDocument } from '../../schemas/user.schema';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: UserDocument) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      reputationScore: user.reputationScore,
      totalWins: user.totalWins,
      paymentsCompleted: user.paymentsCompleted,
      avgPaymentTimeMinutes: user.avgPaymentTimeMinutes,
      bidderNumber: user.bidderNumber,
      displayName: `Bidder #${user.bidderNumber?.toString().padStart(3, '0')}`,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: UserDocument,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(user._id.toString(), updateDto);
  }

  @Post('me/add-funds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add funds to wallet (demo mode)' })
  async addFunds(
    @CurrentUser() user: UserDocument,
    @Body() body: { amount: number },
  ) {
    return this.usersService.addFunds(user._id.toString(), body.amount);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get public bidder profile' })
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // Admin routes
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (admin)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (admin)' })
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateDto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, updateDto);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user (admin)' })
  async verifyUser(@Param('id') id: string) {
    return this.usersService.verifyUser(id);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ban user (admin)' })
  async banUser(@Param('id') id: string, @Body() banDto: BanUserDto) {
    return this.usersService.banUser(id, banDto);
  }

  @Post(':id/unban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unban user (admin)' })
  async unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(id);
  }
}
