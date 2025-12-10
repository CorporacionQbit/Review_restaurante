// src/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Review } from './review.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { ReviewReport } from './review-report.entity';

import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Restaurant,
      ReviewReport,   // <-- LO QUE FALTABA
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
