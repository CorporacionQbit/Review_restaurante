// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
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
}
