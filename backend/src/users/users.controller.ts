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
} from '@nestjs/common';
import type { AuthRequest } from '../auth/auth.middleware';

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
}
