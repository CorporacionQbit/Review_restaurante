// src/restaurants/restaurant.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { AuthRequest } from '../auth/auth.middleware';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create.dto';
import { UpdateRestaurantDto } from './dto/update.dto';
import { FilterRestaurantsDto } from './dto/filter-restaurants.dto';
import { ValidateRestaurantDto } from './dto/validate-restaurant.dto';


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

  // Dueño obtiene sus restaurantes

  @Get('my-restaurants')
  async myRestaurants(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños pueden ver sus restaurantes');
    }

    return this.restaurantsService.findByOwner(req.user.userId);
  }


  // Admin obtiene todos los restaurantes
  
  @Get()
  async findAll(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden ver todos los restaurantes');
    }

    return this.restaurantsService.findAll();
  }

  // Búsqueda con filtros (público / cliente)
 
 
  @Get('search')
  async search(@Query() filters: FilterRestaurantsDto) {
    return this.restaurantsService.findWithFilters(filters);
  }

  // Obtener restaurante por ID (público)
 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(Number(id));
  }

  
  // Dueño actualiza su restaurante
 
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

  // Dueño elimina su restaurante

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.restaurantsService.delete(Number(id), req.user.userId);
  }

 
  // Subir imagen a restaurante (OWNER)
  // POST /restaurants/:id/images

  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Solo se permiten archivos de imagen'), false);
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // maximo por imagen 10 MB
      },
    }),
  )
  async uploadImage(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños pueden subir imágenes');
    }

    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.restaurantsService.addImage(
      Number(id),
      req.user.userId,
      file,
    );
  }
  @Patch(':id/validate')
  async validateRestaurant(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: ValidateRestaurantDto,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException(
        'Solo administradores pueden validar restaurantes',
      );
    }

    return this.restaurantsService.validateRestaurant(Number(id), dto);
  }

}
