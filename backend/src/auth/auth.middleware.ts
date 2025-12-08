import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    isRestaurantOwner: boolean;
    restaurantIds: number[];
  };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token faltante o inválido');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const payload = await this.jwtService.verifyAsync(token);

      req.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role ?? 'client',
        isRestaurantOwner: payload.isRestaurantOwner ?? false,
        restaurantIds: payload.restaurantIds ?? [],
      };

      return next();
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}