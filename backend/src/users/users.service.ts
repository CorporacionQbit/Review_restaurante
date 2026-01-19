// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UpdateUserDto } from './dto/update.dto';
import { RestaurantsService } from 'src/restaurants/restaurants.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  // =========================
  // BÁSICOS
  // =========================
  findAll() {
    return this.usersRepo.find();
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(userId: number) {
    return this.usersRepo.findOne({ where: { userId } });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
  }) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async save(user: User) {
    return this.usersRepo.save(user);
  }

  // =========================
  // PERFIL
  // =========================
  async updateProfile(userId: number, dto: UpdateUserDto) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.profilePictureUrl !== undefined)
      user.profilePictureUrl = dto.profilePictureUrl;
    if (dto.location !== undefined) user.location = dto.location;

    return this.usersRepo.save(user);
  }

  async deactivateUser(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = false;
    return this.usersRepo.save(user);
  }

  // =========================
  // CONVERTIR A OWNER
  // =========================
  async convertToOwner(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.role = 'owner';
    return this.usersRepo.save(user);
  }

  // =========================
  // ADMIN - OWNERS CON MÉTRICAS
  // =========================
  async findOwnersWithRestaurants(
    page: number,
    limit: number,
    status?: 'active' | 'inactive',
  ) {
    const qb = this.usersRepo
      .createQueryBuilder('u')
      .leftJoin('restaurants', 'r', 'r.owner_user_id = u.user_id')
      .select([
        'u.user_id AS "userId"',
        'u.email AS "email"',
        'u.full_name AS "fullName"',
        'u.is_active AS "isActive"',
        'COUNT(r.restaurant_id) AS "totalRestaurants"',
        `SUM(CASE WHEN r.onboarding_status = 'Aprobado' THEN 1 ELSE 0 END) AS "approved"`,
        `SUM(CASE WHEN r.onboarding_status = 'Pendiente' THEN 1 ELSE 0 END) AS "pending"`,
        `SUM(CASE WHEN r.onboarding_status = 'Rechazado' THEN 1 ELSE 0 END) AS "rejected"`,
      ])
      .where('u.role = :role', { role: 'owner' });

    // 🔍 FILTRO POR ESTADO
    if (status === 'active') {
      qb.andWhere('u.is_active = true');
    }
    if (status === 'inactive') {
      qb.andWhere('u.is_active = false');
    }

    qb.groupBy('u.user_id');

    // TOTAL REAL ANTES DE PAGINAR
    const total = await qb.getCount();

    qb.offset((page - 1) * limit).limit(limit);

    const data = await qb.getRawMany();

    return {
      data,
      meta: { total, page, limit },
    };
  }

  // =========================
  // RESTAURANTES DE OWNER
  // =========================
  async findRestaurantsByOwner(userId: number) {
    return this.restaurantsService.findByOwner(userId);
  }

  // =========================
  // ADMIN - ACTIVAR / DESACTIVAR OWNER
  // =========================
  async setOwnerActive(userId: number, active: boolean) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = active;
    return this.usersRepo.save(user);
  }

  // =========================
  // ADMIN - CLIENTES (FILTROS + PAGINACIÓN REAL)
  // =========================
  async findClients(
    page: number,
    limit: number,
    status?: 'active' | 'inactive',
    search?: string,
  ) {
    const qb = this.usersRepo
      .createQueryBuilder('u')
      .select([
        'u.user_id AS "userId"',
        'u.email AS "email"',
        'u.full_name AS "fullName"',
        'u.role AS "role"',
        'u.is_active AS "isActive"',
      ])
      .where('u.role = :role', { role: 'client' });

    // 🔍 FILTRO POR ESTADO
    if (status === 'active') {
      qb.andWhere('u.is_active = true');
    }
    if (status === 'inactive') {
      qb.andWhere('u.is_active = false');
    }

    // 🔍 FILTRO POR TEXTO
    if (search?.trim()) {
      qb.andWhere(
        '(LOWER(u.email) LIKE :term OR LOWER(u.full_name) LIKE :term)',
        { term: `%${search.toLowerCase()}%` },
      );
    }

    // TOTAL REAL (ANTES DE OFFSET)
    const total = await qb.getCount();

    qb.offset((page - 1) * limit).limit(limit);

    const data = await qb.getRawMany();

    return {
      data,
      meta: { total, page, limit },
    };
  }
}
