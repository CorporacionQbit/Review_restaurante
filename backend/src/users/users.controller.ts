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
} from '@nestjs/common';
import type { AuthRequest } from '../auth/auth.middleware';
import { ForbiddenException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Obtener todos (solo para pruebas)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Obtener perfil del usuario autenticado
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.findById(req.user.userId);
  }

  // Actualizar perfil propio
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateUserDto) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  // Desactivar cuenta propia
  @Delete('me')
  deactivateMe(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.deactivateUser(req.user.userId);
  }

//  convertir usuario en dueño

  @Post('me/convert-to-owner')
  convertToOwner(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.usersService.convertToOwner(req.user.userId);
  }
  
  @Get('admin/owners')
async getOwnersWithRestaurants(
  @Req() req: AuthRequest,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.usersService.findOwnersWithRestaurants(+page, +limit);
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

}
