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

  async getRestaurantTimeline(
  restaurantId: number,
  ownerId: number,
  range: '7d' | '30d' | '90d',
) {
  const days = Number(range.replace('d', ''));
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const restaurant = await this.restaurantRepo.findOne({
    where: { restaurantId, ownerUserId: ownerId },
  });

  if (!restaurant) {
    throw new ForbiddenException('No tienes acceso a este restaurante');
  }

  const rows = await this.eventRepo
    .createQueryBuilder('e')
    .select(`DATE(e.created_at)`, 'date')
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'VIEW_PROFILE' THEN 1 ELSE 0 END)`,
      'views',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_MAP' THEN 1 ELSE 0 END)`,
      'clickMap',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_WEBSITE' THEN 1 ELSE 0 END)`,
      'clickWebsite',
    )
    .where('e.restaurant_id = :restaurantId', { restaurantId })
    .andWhere('e.created_at >= :fromDate', { fromDate })
    .groupBy('DATE(e.created_at)')
    .orderBy('DATE(e.created_at)', 'ASC')
    .getRawMany();

  return rows.map(r => ({
    date: r.date,
    views: Number(r.views),
    clickMap: Number(r.clickMap),
    clickWebsite: Number(r.clickWebsite),
  }));
}

  async getRestaurantSummary(
  restaurantId: number,
  ownerId: number,
  range: '7d' | '30d' | '90d',
) {
  const restaurant = await this.restaurantRepo.findOne({
    where: { restaurantId, ownerUserId: ownerId },
  });

  if (!restaurant) {
    throw new ForbiddenException('No tienes acceso a este restaurante');
  }

  const days = Number(range.replace('d', ''));
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const result = await this.eventRepo
    .createQueryBuilder('e')
    .select(
      `SUM(CASE WHEN e.event_type = 'VIEW_PROFILE' THEN 1 ELSE 0 END)`,
      'views',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_MAP' THEN 1 ELSE 0 END)`,
      'clickMap',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_WEBSITE' THEN 1 ELSE 0 END)`,
      'clickWebsite',
    )
    .where('e.restaurant_id = :restaurantId', { restaurantId })
    .andWhere('e.created_at >= :fromDate', { fromDate })
    .getRawOne();

  return {
    views: Number(result.views ?? 0),
    clickMap: Number(result.clickMap ?? 0),
    clickWebsite: Number(result.clickWebsite ?? 0),
    range,
  };
}
async getOwnerSummary(
  ownerId: number,
  range: '7d' | '30d' | '90d',
) {
  const days = Number(range.replace('d', ''));
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  // 1️⃣ Obtener restaurantes del owner
  const restaurants = await this.restaurantRepo.find({
    where: { ownerUserId: ownerId },
    select: ['restaurantId'],
  });

  if (!restaurants.length) {
    return {
      restaurants: 0,
      views: 0,
      clickMap: 0,
      clickWebsite: 0,
      range,
    };
  }

  const restaurantIds = restaurants.map(r => r.restaurantId);

  // 2️⃣ Agregados globales
  const result = await this.eventRepo
    .createQueryBuilder('e')
    .select(
      `SUM(CASE WHEN e.event_type = 'VIEW_PROFILE' THEN 1 ELSE 0 END)`,
      'views',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_MAP' THEN 1 ELSE 0 END)`,
      'clickMap',
    )
    .addSelect(
      `SUM(CASE WHEN e.event_type = 'CLICK_WEBSITE' THEN 1 ELSE 0 END)`,
      'clickWebsite',
    )
    .where('e.restaurant_id IN (:...restaurantIds)', { restaurantIds })
    .andWhere('e.created_at >= :fromDate', { fromDate })
    .getRawOne();

  return {
    restaurants: restaurantIds.length,
    views: Number(result.views ?? 0),
    clickMap: Number(result.clickMap ?? 0),
    clickWebsite: Number(result.clickWebsite ?? 0),
    range,
  };
}

}
