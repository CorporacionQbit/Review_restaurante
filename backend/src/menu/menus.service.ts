import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Menu } from './menu.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  // CREAR MENÚ  solo 1 menu por restaurante 
  
  async create(
    ownerId: number,
    restaurantId: number,
    dto: CreateMenuDto,
  ) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerUserId: ownerId,
      },
      relations: ['menus'],
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante no encontrado o no te pertenece',
      );
    }

    // PLAN NORMAL NO PUEDE
    if (!restaurant.isPremium) {
      throw new ForbiddenException(
        'Solo restaurantes con plan Premium pueden subir menú',
      );
    }

    //  MÁXIMO 1 MENÚ
    if (restaurant.menus.length >= 1) {
      throw new ForbiddenException(
        'Este restaurante ya tiene un menú. Máximo permitido: 1.',
      );
    }

    const menu = this.menuRepo.create({
      menuUrl: dto.menuUrl,
      description: dto.description,
      restaurant,
    });

    return this.menuRepo.save(menu);
  }

  
  // OBTENER MENÚS POR RESTAURANTE (PÚBLICO)

  async findByRestaurant(restaurantId: number) {
    return this.menuRepo.find({
      where: { restaurant: { restaurantId } },
      order: { menuId: 'DESC' },
    });
  }


  // actualizar menu modo dueño 

  async update(
    menuId: number,
    ownerId: number,
    dto: UpdateMenuDto,
  ) {
    const menu = await this.menuRepo.findOne({
      where: { menuId },
      relations: ['restaurant'],
    });

    if (!menu) {
      throw new NotFoundException('Menú no encontrado');
    }

    if (menu.restaurant.ownerUserId !== ownerId) {
      throw new ForbiddenException(
        'No puedes modificar este menú',
      );
    }

    // 🔒 Seguridad extra: si por algún motivo dejó de ser premium
    if (!menu.restaurant.isPremium) {
      throw new ForbiddenException(
        'Solo restaurantes Premium pueden modificar menú',
      );
    }

    Object.assign(menu, dto);

    return this.menuRepo.save(menu);
  }

  // Eliminar menu solo dueño 
  async delete(menuId: number, ownerId: number) {
    const menu = await this.menuRepo.findOne({
      where: { menuId },
      relations: ['restaurant'],
    });

    if (!menu) {
      throw new NotFoundException('Menú no encontrado');
    }

    if (menu.restaurant.ownerUserId !== ownerId) {
      throw new ForbiddenException(
        'No puedes eliminar este menú',
      );
    }

    await this.menuRepo.remove(menu);

    return { success: true };
  }
}
