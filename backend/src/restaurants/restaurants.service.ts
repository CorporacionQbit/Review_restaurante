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
import { PaginationQueryDto } from '../filters/dto/pagination-query.dto';
import { buildPaginationMeta } from '../filters/paginate';

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

  // =========================
  // CREAR RESTAURANTE (OWNER)
  // =========================
  async create(ownerUserId: number, dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create({
      ownerUserId,
      ...dto,
      mapsUrl: null,
      isPremium: false,
      isApproved: false,
    });

    return this.restaurantRepo.save(restaurant);
  }

  // =========================
  // RESTAURANTES DEL OWNER
  // =========================
  async findByOwner(ownerUserId: number) {
    return this.restaurantRepo.find({
      where: { ownerUserId },
      relations: ['images', 'menus', 'posts'],
      order: { restaurantId: 'DESC' },
    });
  }

  // =========================
  // TODOS (ADMIN) – PAGINADO
  // =========================
  async findAllPaginated(pagination: PaginationQueryDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [data, total] = await this.restaurantRepo.findAndCount({
      relations: ['images'],
      order: { restaurantId: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  // =========================
  // OBTENER POR ID (PÚBLICO)
  // =========================
  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
      relations: ['images', 'menus', 'posts'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  // =========================
  // ACTUALIZAR (OWNER)
  // =========================
  async update(id: number, ownerUserId: number, dto: UpdateRestaurantDto) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException('No puedes modificar este restaurante');
    }

    // Reglas por plan
    if (!restaurant.isPremium && dto.mapsUrl) {
      throw new ForbiddenException(
        'El plan Normal no puede usar mapsUrl',
      );
    }

    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  // =========================
  // ELIMINAR RESTAURANTE
  // =========================
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

    for (const img of restaurant.images ?? []) {
      const fullPath = path.join(process.cwd(), img.imageUrl);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await this.restaurantRepo.remove(restaurant);
    return { success: true };
  }

  // =========================
  // SUBIR IMAGEN (POR PLAN)
  // =========================
  async addImage(restaurantId: number, ownerUserId: number, file: any) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, ownerUserId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const count = await this.imageRepo.count({
      where: { restaurant: { restaurantId } },
    });

    const limit = restaurant.isPremium ? 5 : 2;

    if (count >= limit) {
      throw new ForbiddenException(
        `Límite de imágenes alcanzado (${limit})`,
      );
    }

    const image = this.imageRepo.create({
      restaurant,
      imageUrl: `uploads/restaurants/${file.filename}`,
      isVisible: true,
    });

    return this.imageRepo.save(image);
  }

  // =========================
  // BÚSQUEDA + PAGINACIÓN
  // =========================
  async findWithFilters(
    filters: FilterRestaurantsDto,
    pagination: PaginationQueryDto,
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const qb = this.restaurantRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.images', 'img')
      .where('r.isApproved = true');

    if (filters.name) {
      qb.andWhere('(r.name ILIKE :s OR r.description ILIKE :s)', {
        s: `%${filters.name}%`,
      });
    }

    if (filters.city) qb.andWhere('r.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.zone) qb.andWhere('r.zone = :zone', { zone: filters.zone });
    if (filters.isPremium !== undefined)
      qb.andWhere('r.isPremium = :p', { p: filters.isPremium });

    qb.orderBy('r.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  // =========================
  // VALIDACIÓN (ADMIN)
  // =========================
  async validateRestaurant(id: number, dto: ValidateRestaurantDto) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    restaurant.isApproved = dto.isApproved;
    restaurant.isPremium = dto.isPremium ?? restaurant.isPremium;
    restaurant.onboardingComment = dto.onboardingComment ?? null;

    return this.restaurantRepo.save(restaurant);
  }
}
