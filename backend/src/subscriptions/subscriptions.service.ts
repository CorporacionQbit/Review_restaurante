import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Subscription } from './subscription.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { Payment } from '../payments/payments.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  // ===============================
  // UTILIDAD
  // ===============================
  private async getRestaurantByOwner(ownerId: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerUserId: ownerId },
    });

    if (!restaurant) {
      throw new NotFoundException('No tienes restaurante');
    }

    return restaurant;
  }

  // ===============================
  // MI SUSCRIPCIÓN
  // ===============================
  async getMySubscription(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    let sub = await this.subscriptionRepo.findOne({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
      relations: ['restaurant'],
    });

    if (!sub) {
      sub = this.subscriptionRepo.create({
        restaurant,
        planType: 'Normal',
        isActive: true,
        startDate: new Date().toISOString().slice(0, 10),
      });

      sub = await this.subscriptionRepo.save(sub);
    }

    return sub;
  }

  // ===============================
  // UPGRADE
  // ===============================
  async upgrade(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    let sub = await this.subscriptionRepo.findOne({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
    });

    if (!sub) {
      sub = this.subscriptionRepo.create({
        restaurant,
        planType: 'Normal',
        isActive: true,
        startDate: new Date().toISOString().slice(0, 10),
      });
    }

    if (sub.planType === 'Premium') {
      throw new BadRequestException('Ya es Premium');
    }

    sub.planType = 'Premium';
    sub.isActive = true;
    sub.canceledAt = undefined;
    sub.cancelReason = undefined;

    await this.subscriptionRepo.save(sub);

    restaurant.isPremium = true;
    await this.restaurantRepo.save(restaurant);

   return await this.getMySubscription(ownerId);

  }

  // ===============================
  // DOWNGRADE
  // ===============================
  async downgrade(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const sub = await this.subscriptionRepo.findOne({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
    });

    if (!sub || sub.planType === 'Normal') {
      throw new BadRequestException('Ya estás en plan Normal');
    }

    sub.planType = 'Normal';
    await this.subscriptionRepo.save(sub);

    restaurant.isPremium = false;
    await this.restaurantRepo.save(restaurant);

   return await this.getMySubscription(ownerId);

  }

  // ===============================
  // CANCELAR
  // ===============================
  async cancel(ownerId: number, reason: string) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const sub = await this.subscriptionRepo.findOne({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
    });

    if (!sub || !sub.isActive) {
      throw new BadRequestException('La suscripción ya está cancelada');
    }

    sub.isActive = false;
    sub.canceledAt = new Date();
    sub.cancelReason = reason || 'Cancelada por el usuario';

    await this.subscriptionRepo.save(sub);

    restaurant.isPremium = false;
    await this.restaurantRepo.save(restaurant);

    return { message: 'Suscripción cancelada correctamente' };
  }

  // ===============================
  // HISTORIAL / PAGOS
  // ===============================
  async getHistoryByOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    return this.subscriptionRepo.find({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
      relations: ['restaurant'],
      order: { startDate: 'DESC' },
    });
  }

  async getPaymentHistoryByOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const subs = await this.subscriptionRepo.find({
      where: { restaurant: { restaurantId: restaurant.restaurantId } },
    });

    if (!subs.length) return [];

    const subIds = subs.map(s => s.subscriptionId);

    return this.paymentRepo.find({
      where: {
        subscription: {
          subscriptionId: In(subIds),
        },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
