import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create.dto';
import { UpdateRestaurantDto } from './dto/update.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async create(ownerId: number, dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create({
      ...dto,
      ownerUserId: ownerId,
    });

    return this.restaurantRepo.save(restaurant);
  }

  findByOwner(ownerId: number) {
    return this.restaurantRepo.find({
      where: { ownerUserId: ownerId },
    });
  }

  findAll() {
    return this.restaurantRepo.find();
  }

  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  async update(id: number, ownerId: number, dto: UpdateRestaurantDto) {
    const restaurant = await this.findOne(id);

    if (restaurant.ownerUserId !== ownerId) {
      throw new ForbiddenException('No puedes modificar un restaurante que no es tuyo');
    }

    Object.assign(restaurant, dto);

    return this.restaurantRepo.save(restaurant);
  }

  async delete(id: number, ownerId: number) {
    const restaurant = await this.findOne(id);

    if (restaurant.ownerUserId !== ownerId) {
      throw new ForbiddenException('No puedes eliminar un restaurante que no es tuyo');
    }

    await this.restaurantRepo.remove(restaurant);

    return { message: 'Restaurante eliminado' };
  }
}
