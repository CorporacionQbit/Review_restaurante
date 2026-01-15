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

//convertir de usuario a dueño
  async convertToOwner(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.role = 'owner';
    return this.usersRepo.save(user);
  }
  async save(user: User) {
  return this.usersRepo.save(user);
}
 async findOwnersWithRestaurants(page: number, limit: number) {
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
      .where('u.role = :role', { role: 'owner' })
      .groupBy('u.user_id')
      .offset((page - 1) * limit)
      .limit(limit);

    const data = await qb.getRawMany();

    const total = await this.usersRepo.count({
      where: { role: 'owner' },
    });

    return {
      data,
      meta: { total, page, limit },
    };
  }

  // =========================
  // RESTAURANTES DE UN OWNER
  // =========================
  async findRestaurantsByOwner(userId: number) {
    return this.restaurantsService.findByOwner(userId);
  }
}
