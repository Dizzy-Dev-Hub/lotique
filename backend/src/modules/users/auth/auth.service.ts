import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { RegisterDto, LoginDto } from '../dto/user.dto';
import { UserDocument, UserStatus } from '../../../schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    // Check if IP is banned
    if (ipAddress && (await this.usersService.isIPBanned(ipAddress))) {
      throw new BadRequestException(
        'Registration not allowed from this location',
      );
    }

    const user = await this.usersService.create(registerDto);
    const tokens = this.generateTokens(user);

    await this.usersService.updateLastLogin(user._id, ipAddress);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<AuthResponse> {
    // Check if IP is banned
    if (ipAddress && (await this.usersService.isIPBanned(ipAddress))) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.usersService.updateLastLogin(user._id, ipAddress);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument | null> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status === UserStatus.BANNED) {
      return null;
    }
    return user;
  }

  private generateTokens(user: UserDocument): { accessToken: string } {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      bidderNumber: user.bidderNumber,
      displayName: `Bidder #${user.bidderNumber?.toString().padStart(3, '0')}`,
      reputationScore: user.reputationScore,
      createdAt: user.createdAt,
    };
  }
}
