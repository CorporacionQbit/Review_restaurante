import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEvent } from './restaurant-event.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(RestaurantEvent)
    private readonly eventRepo: Repository<RestaurantEvent>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

 async getRestaurantSummary(restaurantId: number, ownerId: number) {
  const restaurant = await this.restaurantRepo.findOne({
    where: { restaurantId },
  });

  if (!restaurant) {
    throw new ForbiddenException('Restaurante no existe');
  }

  if (restaurant.ownerUserId !== ownerId) {
    throw new ForbiddenException('No tienes acceso a este restaurante');
  }

  const views = await this.eventRepo.count({
    where: { restaurantId, eventType: 'VIEW_PROFILE' },
  });

  const clickMap = await this.eventRepo.count({
    where: { restaurantId, eventType: 'CLICK_MAP' },
  });

  const clickWebsite = await this.eventRepo.count({
    where: { restaurantId, eventType: 'CLICK_WEBSITE' },
  });

  return { views, clickMap, clickWebsite };
}


}
