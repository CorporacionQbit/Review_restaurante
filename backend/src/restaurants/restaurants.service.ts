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
import { RestaurantDocument } from './restaurant-document.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(RestaurantImage)
    private readonly imageRepo: Repository<RestaurantImage>,

    
@InjectRepository(RestaurantDocument)
private readonly documentRepo: Repository<RestaurantDocument>,
  ) {}

  // =========================
  // CREAR RESTAURANTE (OWNER)
  // =========================
 async create(ownerUserId: number, dto: CreateRestaurantDto) {
  const { categoryIds, ...rest } = dto;

  const restaurant = this.restaurantRepo.create({
    ownerUserId,
    ...rest,
    mapsUrl: null,
    isPremium: false,
    isApproved: false,
  });

  const savedRestaurant = await this.restaurantRepo.save(restaurant);

  // 🔹 NUEVO (SIN modificar lógica existente)
  if (categoryIds && categoryIds.length > 0) {
    await this.restaurantRepo
      .createQueryBuilder()
      .insert()
      .into('restaurant_categories')
      .values(
        categoryIds.map((categoryId) => ({
          restaurant_id: savedRestaurant.restaurantId,
          category_id: categoryId,
        })),
      )
      .execute();
  }

  return savedRestaurant;
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
  const page = Number(pagination.page ?? 1);
  const limit = Number(pagination.limit ?? 12);

  const qb = this.restaurantRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.images', 'img')
    .leftJoin(
      'restaurant_categories',
      'rc',
      'rc.restaurant_id = r.restaurant_id',
    )
    .where('r.isApproved = true');

  if (filters.search) {
    qb.andWhere('(r.name ILIKE :s OR r.description ILIKE :s)', {
      s: `%${filters.search}%`,
    });
  }

  if (filters.city) {
    qb.andWhere('r.city ILIKE :city', { city: `%${filters.city}%` });
  }

  if (filters.zone) {
    qb.andWhere('r.zone = :zone', { zone: filters.zone });
  }

  if (filters.minRating) {
    qb.andWhere('r.avgRating >= :rating', {
      rating: filters.minRating,
    });
  }

  // ✅ FILTRO POR CATEGORÍA (SIN CONTROLLER)
  if (filters.categoryId) {
    qb.andWhere('rc.category_id = :cat', {
      cat: filters.categoryId,
    });
  }

  if (filters.isPremium !== undefined) {
    qb.andWhere('r.isPremium = :p', { p: filters.isPremium });
  }

  switch (filters.orderBy) {
    case 'rating':
      qb.orderBy('r.avgRating', 'DESC');
      break;
    case 'reviews':
      qb.orderBy('r.totalReviews', 'DESC');
      break;
    case 'price':
      qb.orderBy('r.priceRange', 'ASC');
      break;
    default:
      qb.orderBy('r.name', 'ASC');
  }

  qb.skip((page - 1) * limit).take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data: data.map(r => ({
      restaurantId: r.restaurantId,
      name: r.name,
      description: r.description,
      city: r.city,
      zone: r.zone,
      avgRating: r.avgRating,
      totalReviews: r.totalReviews,
      priceRange: r.priceRange,
      imageUrl: r.images?.[0]?.imageUrl ?? null,
      isPremium: r.isPremium,
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
}

  // =========================
  // VALIDACIÓN (ADMIN)
  // =========================
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

  if (dto.isApproved) {
    restaurant.isApproved = true;
    restaurant.onboardingStatus = 'Aprobado';
  } else {
    restaurant.isApproved = false;
    restaurant.onboardingStatus = 'Rechazado';
  }

  restaurant.isPremium =
    dto.isPremium ?? restaurant.isPremium;

  restaurant.onboardingComment =
    dto.onboardingComment ?? null;

  return this.restaurantRepo.save(restaurant);
}


// ADMIN – RESTAURANTES PENDIENTES (PAGINADO)

async findPendingRestaurants(
  page = 1,
  limit = 10,
) {
  const [data, total] =
    await this.restaurantRepo.findAndCount({
      where: {
        isApproved: false,
        onboardingStatus: 'Pendiente',
      },
      relations: ['owner', 'images'],
      order: { restaurantId: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    },
  };
}

async findHistory(pagination: PaginationQueryDto) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;

  const qb = this.restaurantRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.owner', 'owner')
    .where('r.onboardingStatus IN (:...statuses)', {
      statuses: ['Aprobado', 'Rechazado'],
    })
    .orderBy('r.restaurantId', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data: data.map(r => ({
      restaurantId: r.restaurantId,
      name: r.name,
      city: r.city,
      onboardingStatus: r.onboardingStatus,
      onboardingComment: r.onboardingComment,
      owner: {
        userId: r.owner.userId,
        email: r.owner.email,
        fullName: r.owner.fullName,
      },
    })),
    meta: buildPaginationMeta(total, page, limit),
  };
}
async uploadDocument(
  restaurantId: number,
  ownerUserId: number,
  docType: 'RTU' | 'PATENTE',
  file: Express.Multer.File,
) {
  const restaurant = await this.restaurantRepo.findOne({
    where: {
      restaurantId,
      ownerUserId,
      onboardingStatus: 'Pendiente', // ✅ CLAVE
    },
  });

  if (!restaurant) {
    throw new ForbiddenException(
      'No puedes subir documentos a este restaurante',
    );
  }

  const document = this.documentRepo.create({
    restaurant,
    docType,
    fileUrl: `uploads/restaurants/documents/${file.filename}`,
    isVerified: false,
  });

  return this.documentRepo.save(document);
}
// =========================
// OBTENER DOCUMENTOS (ADMIN)
// =========================
async getDocumentsByRestaurant(restaurantId: number) {
  return this.documentRepo.find({
    where: {
      restaurant: { restaurantId },
    },
    order: {
      docType: 'ASC',
    },
  });
}


}
