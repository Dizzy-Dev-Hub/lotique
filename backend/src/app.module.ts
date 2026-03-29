import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

// Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/users/auth/auth.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { BidsModule } from './modules/bids/bids.module';

// Services
import { AuctionSchedulerService } from './common/auction-scheduler.service';

// Schemas (for scheduler)
import { Auction, AuctionSchema } from './schemas/auction.schema';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),

    // Schemas for root module
    MongooseModule.forFeature([{ name: Auction.name, schema: AuctionSchema }]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature modules
    UsersModule,
    AuthModule,
    AuctionsModule,
    BidsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuctionSchedulerService],
})
export class AppModule {}
