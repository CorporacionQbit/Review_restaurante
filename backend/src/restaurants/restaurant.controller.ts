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
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';

import type { AuthRequest } from '../auth/auth.middleware';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create.dto';
import { UpdateRestaurantDto } from './dto/update.dto';
import { FilterRestaurantsDto } from './dto/filter-restaurants.dto';
import { ValidateRestaurantDto } from './dto/validate-restaurant.dto';
import { PaginationQueryDto } from '../filters/dto/pagination-query.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  // =========================
  // CREAR RESTAURANTE (OWNER)
  // =========================
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateRestaurantDto) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños pueden crear restaurantes');
    }
    return this.service.create(req.user.userId, dto);
  }

  // =========================
  // RESTAURANTES DEL OWNER
  // =========================
  @Get('owner/my-restaurants')
  async myRestaurants(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños');
    }
    return this.service.findByOwner(req.user.userId);
  }

  // =========================
  // ADMIN – LISTADO PAGINADO
  // =========================
  @Get()
  async findAll(
    @Req() req: AuthRequest,
    @Query() pagination: PaginationQueryDto,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }
    return this.service.findAllPaginated(pagination);
  }

  // =========================
  // SEARCH + PAGINACIÓN (PÚBLICO)
  // =========================
@Get('search')
async search(@Query() query: SearchRestaurantsDto) {
  return this.service.findWithFilters(query, {
    page: query.page,
    limit: query.limit,
  });
}

  // =========================
  // OBTENER RESTAURANTE POR ID (PÚBLICO)
  // =========================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const num = Number(id);
    if (Number.isNaN(num)) {
      throw new BadRequestException('ID inválido');
    }
    return this.service.findOne(num);
  }

  // =========================
  // ACTUALIZAR RESTAURANTE (OWNER)
  // =========================
  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.service.update(Number(id), req.user.userId, dto);
  }

  // =========================
  // ELIMINAR RESTAURANTE (OWNER)
  // =========================
  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.service.delete(Number(id), req.user.userId);
  }

  // =========================
  // SUBIR IMAGEN (OWNER)
  // =========================
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException();
    }
    return this.service.addImage(Number(id), req.user.userId, file);
  }

  // =========================
  // VALIDAR RESTAURANTE (ADMIN)
  // =========================
  @Patch(':id/validate')
  async validate(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: ValidateRestaurantDto,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException();
    }
    return this.service.validateRestaurant(Number(id), dto);
  }
 
@Get('admin/pending')
async pendingRestaurants(
  @Req() req: AuthRequest,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.service.findPendingRestaurants(
    Number(page ?? 1),
    Number(limit ?? 10),
  );
}
// =========================
// ADMIN – HISTORIAL
// =========================
@Get('admin/history')
async history(
  @Req() req: AuthRequest,
  @Query() pagination: PaginationQueryDto,
) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.service.findHistory(pagination);
}

}

