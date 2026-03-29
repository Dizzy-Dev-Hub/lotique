import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  User,
  UserDocument,
  UserStatus,
  UserRole,
} from '../../schemas/user.schema';
import {
  RegisterDto,
  UpdateUserDto,
  AdminUpdateUserDto,
  BanUserDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private bidderNumberCounter = 0;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.initializeBidderCounter();
  }

  private async initializeBidderCounter() {
    const lastUser = await this.userModel
      .findOne({ bidderNumber: { $exists: true } })
      .sort({ bidderNumber: -1 })
      .exec();
    this.bidderNumberCounter = lastUser?.bidderNumber || 0;
  }

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = new this.userModel({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      bidderNumber: ++this.bidderNumberCounter,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateLastLogin(
    userId: string | Types.ObjectId,
    ipAddress?: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
      lastLoginIP: ipAddress,
    });
  }

  async update(
    userId: string,
    updateDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async adminUpdate(
    userId: string,
    updateDto: AdminUpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async verifyUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { status: UserStatus.VERIFIED } },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async banUser(userId: string, banDto: BanUserDto): Promise<UserDocument> {
    const updateData: any = {
      status: UserStatus.BANNED,
      bannedReason: banDto.reason,
      bannedAt: new Date(),
    };

    if (banDto.ipAddress) {
      updateData.$addToSet = { bannedIPs: banDto.ipAddress };
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async unbanUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: { status: UserStatus.VERIFIED },
        $unset: { bannedReason: 1, bannedAt: 1 },
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async isIPBanned(ipAddress: string): Promise<boolean> {
    const bannedUser = await this.userModel.findOne({
      bannedIPs: ipAddress,
      status: UserStatus.BANNED,
    });
    return !!bannedUser;
  }

  async incrementWins(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalWins: 1 },
    });
  }

  async updatePaymentStats(
    userId: string | Types.ObjectId,
    paymentTimeMinutes: number,
  ): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    const newCompleted = user.paymentsCompleted + 1;
    const newAvgTime =
      (user.avgPaymentTimeMinutes * user.paymentsCompleted +
        paymentTimeMinutes) /
      newCompleted;

    // Reputation: fast payments improve score, slow payments decrease it
    let reputationDelta = 0;
    if (paymentTimeMinutes < 30) reputationDelta = 0.1;
    else if (paymentTimeMinutes < 60) reputationDelta = 0.05;
    else if (paymentTimeMinutes > 360)
      reputationDelta = -0.1; // 6+ hours
    else if (paymentTimeMinutes > 720) reputationDelta = -0.2; // 12+ hours

    const newReputation = Math.max(
      0,
      Math.min(5, user.reputationScore + reputationDelta),
    );

    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        paymentsCompleted: newCompleted,
        avgPaymentTimeMinutes: Math.round(newAvgTime),
        reputationScore: Number(newReputation.toFixed(2)),
      },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(),
    ]);
    return { users, total };
  }

  async getPublicProfile(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select(
        'bidderNumber reputationScore totalWins paymentsCompleted avgPaymentTimeMinutes createdAt',
      );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      displayName: `Bidder #${user.bidderNumber?.toString().padStart(3, '0')}`,
      reputationScore: user.reputationScore,
      totalWins: user.totalWins,
      paymentsCompleted: user.paymentsCompleted,
      avgPaymentTimeMinutes: user.avgPaymentTimeMinutes,
      memberSince: user.createdAt,
    };
  }

  async addFunds(
    userId: string,
    amount: number,
  ): Promise<{ walletBalance: number; message: string }> {
    if (amount < 100) {
      throw new BadRequestException('Minimum deposit is $100');
    }
    if (amount > 100000) {
      throw new BadRequestException('Maximum deposit is $100,000');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      walletBalance: user.walletBalance,
      message: `Successfully added $${amount.toLocaleString()} to your wallet`,
    };
  }
}
