import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthRequest } from '../auth/auth.middleware';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create.dto';
import { UpdateRestaurantDto } from './dto/update.dto';
import { UnauthorizedException } from '@nestjs/common';


@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // Dueño crea restaurante
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateRestaurantDto) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo usuarios dueños pueden crear restaurantes');
    }

    return this.restaurantsService.create(req.user.userId, dto);
  }

  // Dueño obtiene sus propios restaurantes
  @Get('my-restaurants')
  async myRestaurants(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños pueden ver sus restaurantes');
    }

    return this.restaurantsService.findByOwner(req.user.userId);
  }

  // administrador que tiene  los restaurantes
  @Get()
  async findAll(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden ver todos los restaurantes');
    }

    return this.restaurantsService.findAll();
  }

  // Obtener por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(Number(id));
  }

  // dueño actualiza su restaurante
 @Patch(':id')
async update(
  @Req() req: AuthRequest,
  @Param('id') id: string,
  @Body() dto: UpdateRestaurantDto,
) {
  if (!req.user) {
    throw new UnauthorizedException('Usuario no autenticado');
  }

  return this.restaurantsService.update(Number(id), req.user.userId, dto);
}

 @Delete(':id')
async delete(@Req() req: AuthRequest, @Param('id') id: string) {
  if (!req.user) {
    throw new UnauthorizedException('Usuario no autenticado');
  }

  return this.restaurantsService.delete(Number(id), req.user.userId);
}

}
