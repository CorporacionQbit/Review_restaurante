import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';

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
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token faltante o inválido');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException(
          'Tu cuenta está desactivada. Contacta al administrador.',
        );
      }

      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        isRestaurantOwner: user.role === 'owner',
        restaurantIds: payload.restaurantIds ?? [],
      };

      return next();
    } catch {
      throw new UnauthorizedException(
        'Token inválido, expirado o cuenta desactivada',
      );
    }
  }
}
