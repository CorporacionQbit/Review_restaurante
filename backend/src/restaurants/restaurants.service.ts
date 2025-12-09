// src/restaurants/restaurants.service.ts
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

  // ===========================
  // CREAR RESTAURANTE (OWNER)
  // ===========================
  async create(ownerUserId: number, dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create({
      ownerUserId,
      ...dto,
    });

    return this.restaurantRepo.save(restaurant);
  }

  // ===========================
  // RESTAURANTES POR OWNER
  // ===========================
  async findByOwner(ownerUserId: number) {
    return this.restaurantRepo.find({
      where: { ownerUserId },
      relations: ['images'],
      order: { restaurantId: 'ASC' },
    });
  }

  // ===========================
  // TODOS LOS RESTAURANTES (ADMIN)
  // ===========================
  async findAll() {
    return this.restaurantRepo.find({
      relations: ['images'],
      order: { restaurantId: 'ASC' },
    });
  }

  // ===========================
  // OBTENER POR ID (PÚBLICO)
  // ===========================
  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
      relations: ['images'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  // ===========================
  // ACTUALIZAR RESTAURANTE (OWNER)
  // ===========================
  async update(
    id: number,
    ownerUserId: number,
    dto: UpdateRestaurantDto,
  ) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException(
        'No puedes modificar un restaurante que no es tuyo',
      );
    }

    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  // ===========================
  // ELIMINAR RESTAURANTE (OWNER)
  // ===========================
  async delete(id: number, ownerUserId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
      relations: ['images'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException(
        'No puedes eliminar un restaurante que no es tuyo',
      );
    }

    // Borrar archivos físicos de imágenes si existen
    if (restaurant.images && restaurant.images.length > 0) {
      for (const img of restaurant.images) {
        if (img.imageUrl) {
          const fullPath = path.join(process.cwd(), img.imageUrl);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    await this.restaurantRepo.remove(restaurant);
    return { success: true };
  }

  // ===========================
  // SUBIR IMAGEN (OWNER)
  // ===========================
  async addImage(
    restaurantId: number,
    ownerUserId: number,
    file: any, // evitamos problemas de tipos con Express.Multer.File
  ) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerUserId,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const image = this.imageRepo.create({
      restaurant,
      imageUrl: `uploads/restaurants/${file.filename}`,
      isVerified: false,
      isVisible: true,
    });

    return this.imageRepo.save(image);
  }

 // ===========================
// BÚSQUEDA / LISTADO CON FILTROS
// ===========================
async findWithFilters(filters: FilterRestaurantsDto) {
  const {
    search,
    city,
    zone,
    minRating,
    maxPriceRange,
    isPremium,
    orderBy,
  } = filters;

  const qb = this.restaurantRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.images', 'img')
    // Solo restaurantes aprobados para mostrar a los usuarios
    .where('r.isApproved = :approved', { approved: true });

  // Texto libre: busca en nombre o descripción
  if (search) {
    qb.andWhere(
      '(r.name ILIKE :search OR r.description ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  // Ciudad (LIKE para permitir "Guate", "Guatemala", etc.)
  if (city) {
    qb.andWhere('r.city ILIKE :city', { city: `%${city}%` });
  }

  // Zona exacta
  if (zone) {
    qb.andWhere('r.zone = :zone', { zone });
  }

  // Rating mínimo
  if (minRating !== undefined) {
    qb.andWhere('r.avgRating >= :minRating', { minRating });
  }

  // Precio máximo (1–5)
  if (maxPriceRange !== undefined) {
    qb.andWhere('r.priceRange <= :maxPriceRange', { maxPriceRange });
  }

  // ¿Solo premium?
  if (isPremium !== undefined) {
    qb.andWhere('r.isPremium = :isPremium', { isPremium });
  }

  // Ordenamiento
  switch (orderBy) {
    case 'rating':
      qb.orderBy('r.avgRating', 'DESC');
      break;
    case 'reviews':
      qb.orderBy('r.totalReviews', 'DESC');
      break;
    case 'price':
      qb.orderBy('r.priceRange', 'ASC');
      break;
    case 'name':
    default:
      qb.orderBy('r.name', 'ASC');
      break;
  }

  return qb.getMany();
}
async validateRestaurant(id: number, dto: ValidateRestaurantDto) {
  const restaurant = await this.restaurantRepo.findOne({
    where: { restaurantId: id },
  });

  if (!restaurant) {
    throw new NotFoundException('Restaurante no encontrado');
  }

  // Actualizamos estado de aprobación
  restaurant.isApproved = dto.isApproved;

  // Estado de onboarding según aprobación
  restaurant.onboardingStatus = dto.isApproved ? 'Aprobado' : 'Rechazado';

  // Comentario opcional del admin
  restaurant.onboardingComment = dto.onboardingComment !== undefined ? dto.onboardingComment : null;

  // Si el admin envía isPremium, lo actualizamos también
  if (dto.isPremium !== undefined) {
    restaurant.isPremium = dto.isPremium;
  }

  return this.restaurantRepo.save(restaurant);
}
  
}
