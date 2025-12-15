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

 
  // UTILIDAD: obtener restaurante del OWNER
  
  private async getRestaurantByOwner(ownerId: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerUserId: ownerId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'El usuario no tiene restaurante asociado',
      );
    }

    return restaurant;
  }


  //  Obtener mi suscripción actual

  async getMySubscription(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const sub = await this.subscriptionRepo.findOne({
      where: { restaurantId: restaurant.restaurantId },
    });

    if (!sub) {
      throw new NotFoundException('No existe suscripción para tu restaurante');
    }

    return sub;
  }


  // Crear suscripción inicial (NORMAL)
  
  async createInitialForOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const existing = await this.subscriptionRepo.findOne({
      where: { restaurantId: restaurant.restaurantId },
    });

    if (existing) return existing;

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);

    const sub = this.subscriptionRepo.create({
      restaurantId: restaurant.restaurantId,
      planType: 'Normal',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isActive: true,
    });

    return this.subscriptionRepo.save(sub);
  }

 
  // 3. Upgrade a PREMIUM
async upgrade(ownerId: number) {
  const restaurant = await this.restaurantRepo.findOne({
    where: { ownerUserId: ownerId },
  });

  if (!restaurant) {
    throw new NotFoundException('No tienes restaurante asociado');
  }

  let sub = await this.subscriptionRepo.findOne({
    where: { restaurantId: restaurant.restaurantId },
  });

  // Si no existe, crear NORMAL
  if (!sub) {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);

    sub = this.subscriptionRepo.create({
      restaurantId: restaurant.restaurantId,
      planType: 'Normal',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isActive: true,
    });

    sub = await this.subscriptionRepo.save(sub);
  }

  if (sub.planType === 'Premium') {
    
    if (!restaurant.isPremium) {
      restaurant.isPremium = true;
      await this.restaurantRepo.save(restaurant);
    }

    throw new BadRequestException('Ya tienes el plan Premium');
  }

  // Upgrade real
  sub.planType = 'Premium';
  sub.isActive = true;
  sub.canceledAt = undefined;
  sub.cancelReason = undefined;

  await this.subscriptionRepo.save(sub);

  //  SINCRONIZACIÓN CLAVE
  restaurant.isPremium = true;
  await this.restaurantRepo.save(restaurant);

  return {
    message: 'Plan actualizado a Premium',
  };
}

  // 4. Downgrade a NORMAL
  
  async downgrade(ownerId: number) {
  const restaurant = await this.getRestaurantByOwner(ownerId);

  const sub = await this.subscriptionRepo.findOne({
    where: { restaurantId: restaurant.restaurantId },
  });

  if (!sub) {
    throw new NotFoundException('Suscripción no encontrada');
  }

  if (sub.planType === 'Normal') {
    throw new BadRequestException('Ya estás en plan Normal');
  }

  // Cambiar plan
  sub.planType = 'Normal';
  sub.isActive = true;

  await this.subscriptionRepo.save(sub);

  //  SINCRONIZAR RESTAURANTE
  restaurant.isPremium = false;
  await this.restaurantRepo.save(restaurant);

  return {
    message: 'Plan cambiado a Normal correctamente',
  };
}


  
  // Reactivar suscripción
   
  async reactivate(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const sub = await this.subscriptionRepo.findOne({
      where: { restaurantId: restaurant.restaurantId },
    });

    if (!sub) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    if (sub.isActive) {
      throw new BadRequestException('La suscripción ya está activa');
    }

    sub.isActive = true;
    sub.canceledAt = undefined;
    sub.cancelReason = undefined;

    return this.subscriptionRepo.save(sub);
  }

  //
  //  Historial de planes (OWNER)
  // 
  async getHistoryByOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    return this.subscriptionRepo.find({
      where: { restaurantId: restaurant.restaurantId },
      order: { startDate: 'DESC' },
    });
  }

  //
  // Historial de pagos (OWNER)
  // 
  async getPaymentHistoryByOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const subs = await this.subscriptionRepo.find({
      where: { restaurantId: restaurant.restaurantId },
    });

    if (!subs.length) return [];

    const subIds = subs.map((s) => s.subscriptionId);

    return this.paymentRepo.find({
      where: {
        subscription: {
          subscriptionId: In(subIds),
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  //  Detalles completos (OWNER)
 
  async getSubscriptionDetailsByOwner(ownerId: number) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    return {
      current: await this.subscriptionRepo.findOne({
        where: { restaurantId: restaurant.restaurantId },
      }),
      history: await this.getHistoryByOwner(ownerId),
      payments: await this.getPaymentHistoryByOwner(ownerId),
    };
  }
 
// Cancelar suscripción (OWNER)

async cancel(ownerId: number, reason: string) {
  const restaurant = await this.getRestaurantByOwner(ownerId);

  const sub = await this.subscriptionRepo.findOne({
    where: { restaurantId: restaurant.restaurantId },
  });

  if (!sub) {
    throw new NotFoundException('Suscripción no encontrada');
  }

  if (!sub.isActive) {
    throw new BadRequestException('La suscripción ya está cancelada');
  }

  sub.isActive = false;
  sub.canceledAt = new Date();
  sub.cancelReason = reason || 'Cancelada por el usuario';

  await this.subscriptionRepo.save(sub);

  //  cancelar premium también en restaurante
  restaurant.isPremium = false;
  await this.restaurantRepo.save(restaurant);

  return {
    message: 'Suscripción cancelada correctamente',
  };
}

}
