// src/subscriptions/subscriptions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

import { Subscription } from './subscription.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { Payment } from '../payments/payments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Restaurant,
      Payment,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}