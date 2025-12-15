import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payments.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Subscription } from '../subscriptions/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription])
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]   // necesario para SubscriptionsModule
})
export class PaymentsModule {}
