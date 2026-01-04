import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { Restaurant } from '../restaurants/restaurant.entity';
import { RestaurantEvent } from './restaurant-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantEvent,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
