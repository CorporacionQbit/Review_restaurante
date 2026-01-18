// src/restaurants/restaurants.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { Restaurant } from './restaurant.entity';
import { RestaurantImage } from './restaurant-image.entity';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurant.controller';
import { RestaurantDocument } from './restaurant-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, RestaurantImage,RestaurantDocument]),
    MulterModule.register({
      dest: './uploads/restaurants',
      
    }),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
