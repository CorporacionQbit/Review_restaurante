// src/auth/owner.middleware.ts
import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.middleware';

@Injectable()
export class OwnerMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!req.user.isRestaurantOwner) {
      throw new ForbiddenException(
        'Se requieren permisos de dueño de restaurante',
      );
    }

    next();
  }
}
