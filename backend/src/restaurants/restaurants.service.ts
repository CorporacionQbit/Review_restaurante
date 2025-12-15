import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './restaurant.entity';
import { RestaurantImage } from './restaurant-image.entity';

import { CreateRestaurantDto } from './dto/create.dto';
import { UpdateRestaurantDto } from './dto/update.dto';
import { FilterRestaurantsDto } from './dto/filter-restaurants.dto';
import { ValidateRestaurantDto } from './dto/validate-restaurant.dto';
import { Subscription } from '../subscriptions/subscription.entity';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(RestaurantImage)
    private readonly imageRepo: Repository<RestaurantImage>,
  ) {}


  // CREAR RESTAURANTE (OWNER)
 
  async create(ownerUserId: number, dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create({
      ownerUserId,
      ...dto,
      mapsUrl: null, // mapsUrl solo premium
    });

    return this.restaurantRepo.save(restaurant);
  }

  // RESTAURANTES DEL OWNER
 
  async findByOwner(ownerUserId: number) {
    return this.restaurantRepo.find({
      where: { ownerUserId },
      relations: ['images', 'menus', 'posts', 'subscription'],
      order: { restaurantId: 'ASC' },
    });
  }

  
  // TODOS LOS RESTAURANTES (ADMIN)

  async findAll() {
    return this.restaurantRepo.find({
      relations: ['images', 'menus', 'posts', 'subscription'],
      order: { restaurantId: 'ASC' },
    });
  }


  // OBTENER POR ID (PÚBLICO)
 
  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
      relations: ['images', 'menus', 'posts', 'subscription'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }


  // ACTUALIZAR RESTAURANTE (OWNER) – VALIDACIONES DE PLAN
  
  async update(id: number, ownerUserId: number, dto: UpdateRestaurantDto) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException('No puedes modificar un restaurante que no es tuyo');
    }

    const isPremium = restaurant.isPremium;

 
    // VALIDACIONES POR PLAN
 

    // mapsUrl prohibido para plan Normal
    if (!isPremium && dto.mapsUrl) {
      throw new ForbiddenException(
        'Los restaurantes del plan Normal NO pueden usar ubicación (mapsUrl).'
      );
    }

    //  Menús prohibidos para plan Normal
    if (!isPremium && (dto as any).menuUrl) {
      throw new ForbiddenException(
        'Solo los restaurantes Premium pueden subir un menú.'
      );
    }

    // Social links solo Premium 
    if (!isPremium && (dto as any).socialLinks) {
      throw new ForbiddenException(
        'Los restaurantes del plan Normal no pueden agregar redes sociales.'
      );
    }

  
    // ASIGNACIÓN FINAL
   
    Object.assign(restaurant, {
      ...dto,
      mapsUrl: isPremium ? dto.mapsUrl ?? restaurant.mapsUrl : null,
    });

    return this.restaurantRepo.save(restaurant);
  }

  
  // ELIMINAR RESTAURANTE
 
  async delete(id: number, ownerUserId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
      relations: ['images'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException('No puedes eliminar este restaurante');
    }

    // Eliminar imágenes físicas
    for (const img of restaurant.images ?? []) {
      const fullPath = path.join(process.cwd(), img.imageUrl);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await this.restaurantRepo.remove(restaurant);
    return { success: true };
  }

  
  // CONTAR IMÁGENES (para validar límite)

  private async countImages(restaurantId: number): Promise<number> {
    return this.imageRepo.count({
      where: { restaurant: { restaurantId } },
    });
  }


  // SUBIR IMAGEN CON LÍMITE POR PLAN

  async addImage(
    restaurantId: number,
    ownerUserId: number,
    file: any,
  ) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, ownerUserId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const currentImages = await this.countImages(restaurantId);
    const limit = restaurant.isPremium ? 5 : 2;

    if (currentImages >= limit) {
      throw new ForbiddenException(
        `Límite de imágenes alcanzado. ` +
        `Plan actual: ${restaurant.isPremium ? 'Premium (5 máximo)' : 'Normal (2 máximo)'}`,
      );
    }

    const image = this.imageRepo.create({
      restaurant,
      imageUrl: `uploads/restaurants/${file.filename}`,
      isVerified: false,
      isVisible: true,
    });

    return this.imageRepo.save(image);
  }

  // FILTROS DE BÚSQUEDA

  async findWithFilters(filters: FilterRestaurantsDto) {
    const qb = this.restaurantRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.images', 'img')
      .where('r.isApproved = true');

    if (filters.name) {
      qb.andWhere('(r.name LIKE :s OR r.description LIKE :s)', {
        s: `%${filters.name}%`,
      });
    }

    if (filters.city) qb.andWhere('r.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.zone) qb.andWhere('r.zone = :zone', { zone: filters.zone });

    if (filters.minRating !== undefined)
      qb.andWhere('r.avgRating >= :rt', { rt: filters.minRating });

    if (filters.maxPriceRange !== undefined)
      qb.andWhere('r.priceRange <= :pr', { pr: filters.maxPriceRange });

    if (filters.isPremium !== undefined)
      qb.andWhere('r.isPremium = :p', { p: filters.isPremium });

    qb.orderBy('r.name', 'ASC');

    return qb.getMany();
  }

  
  // VALIDACIÓN DE RESTAURANTE (ADMIN)

  async validateRestaurant(id: number, dto: ValidateRestaurantDto) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    restaurant.isApproved = dto.isApproved;
    restaurant.onboardingStatus = dto.isApproved ? 'Aprobado' : 'Rechazado';
    restaurant.onboardingComment = dto.onboardingComment ?? null;

    if (dto.isPremium !== undefined) {
      restaurant.isPremium = dto.isPremium;
    }

    return this.restaurantRepo.save(restaurant);
  }
}
