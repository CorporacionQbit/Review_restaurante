// src/favorites/favorites.controller.ts
import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import type { AuthRequest } from '../auth/auth.middleware';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // ➕ Agregar favorito
  @Post(':restaurantId')
  addFavorite(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: number,
  ) {
    return this.favoritesService.addFavorite(
      req.user!.userId,
      Number(restaurantId),
    );
  }

  // ❌ Eliminar favorito
  @Delete(':restaurantId')
  removeFavorite(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: number,
  ) {
    return this.favoritesService.removeFavorite(
      req.user!.userId,
      Number(restaurantId),
    );
  }

  // ❤️ Obtener favoritos del usuario
  @Get('me')
  getMyFavorites(@Req() req: AuthRequest) {
    return this.favoritesService.getUserFavorites(req.user!.userId);
  }
}
