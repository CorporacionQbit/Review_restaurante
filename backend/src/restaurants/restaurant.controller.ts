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
import { PaginationQueryDto } from '../filters/dto/pagination-query.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateRestaurantDto) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños pueden crear restaurantes');
    }
    return this.service.create(req.user.userId, dto);
  }

  @Get('my-restaurants')
  async myRestaurants(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'owner') {
      throw new ForbiddenException('Solo dueños');
    }
    return this.service.findByOwner(req.user.userId);
  }

  // ADMIN – LISTADO PAGINADO
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

  // SEARCH + PAGINACIÓN
  @Get('search')
  async search(
    @Query() filters: FilterRestaurantsDto,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.service.findWithFilters(filters, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const num = Number(id);
    if (Number.isNaN(num)) {
      throw new BadRequestException('ID inválido');
    }
    return this.service.findOne(num);
  }

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

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.service.delete(Number(id), req.user.userId);
  }

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
}
