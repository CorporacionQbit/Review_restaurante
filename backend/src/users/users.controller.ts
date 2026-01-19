// src/users/users.controller.ts

import {
  Controller,
  Get,
  Patch,
  Delete,
  Req,
  Body,
  Post,
  UnauthorizedException,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthRequest } from '../auth/auth.middleware';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // SOLO PRUEBAS
  // =========================
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // =========================
  // PERFIL DEL USUARIO
  // =========================
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateUserDto) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Delete('me')
  deactivateMe(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.deactivateUser(req.user.userId);
  }

  @Post('me/convert-to-owner')
  convertToOwner(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.convertToOwner(req.user.userId);
  }

  // =========================
  // ADMIN - OWNERS
  // =========================
  @Get('admin/owners')
  async getOwnersWithRestaurants(
    @Req() req: AuthRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: 'active' | 'inactive',
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.usersService.findOwnersWithRestaurants(
      +page,
      +limit,
      status,
    );
  }

  @Get('admin/owners/:userId/restaurants')
  async getOwnerRestaurants(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.usersService.findRestaurantsByOwner(+userId);
  }

  @Patch('admin/owners/:userId/activate')
  async activateOwner(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.usersService.setOwnerActive(+userId, true);
  }

  @Patch('admin/owners/:userId/deactivate')
  async deactivateOwner(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.usersService.setOwnerActive(+userId, false);
  }

  // =========================
  // ADMIN - CLIENTES
  // =========================
  @Get('admin/clients')
  async getClients(
    @Req() req: AuthRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: 'active' | 'inactive',
    @Query('search') search?: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.usersService.findClients(
      +page,
      +limit,
      status,
      search,
    );
  }
}
