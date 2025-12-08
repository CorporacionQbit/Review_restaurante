// src/auth/auth.service.ts

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RestaurantsService } from '../restaurants/restaurants.service';

type UserRole = 'client' | 'owner' | 'admin';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly restaurantsService: RestaurantsService,
    private readonly jwtService: JwtService,
  ) {}

 //Registro del cliente
  async register(email: string, password: string, fullName: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Registro siempre como CLIENTE
    const user = await this.usersService.createUser({
      email,
      passwordHash,
      fullName,
    });

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: 'client',
      isRestaurantOwner: false,
      restaurantIds: [],
    });

    return {
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken: token,
    };
  }

  // Login general, como usuario 
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Rol REAL desde la BD
    const role: UserRole = (user.role as UserRole) ?? 'client';

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,                    // ✔ IMPORTANTE
      isRestaurantOwner: user.role === 'owner',
      restaurantIds: [],
    });

    return {
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken: token,
    };
  }

  //login de restaurante solo si es dueño 
  async loginRestaurant(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const restaurants = await this.restaurantsService.findByOwner(user.userId);

    if (!restaurants || restaurants.length === 0) {
      throw new UnauthorizedException(
        'Este usuario no es dueño de ningún restaurante',
      );
    }

    const restaurantIds = restaurants.map((r) => r.restaurantId);

    const dbRole = (user.role as UserRole) ?? 'client';
    const effectiveRole: UserRole = dbRole === 'admin' ? 'admin' : 'owner';

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: effectiveRole,
      isRestaurantOwner: true,
      restaurantIds,
    });

    return {
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
      },
      restaurants: restaurants.map((r) => ({
        id: r.restaurantId,
        name: r.name,
      })),
      accessToken: token,
    };
  }


  //Genearion de token
  private signToken(payload: {
    userId: number;
    email: string;
    role: string;
    isRestaurantOwner: boolean;
    restaurantIds: number[];
  }) {
    return this.jwtService.signAsync({
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      isRestaurantOwner: payload.isRestaurantOwner,
      restaurantIds: payload.restaurantIds,
    });
  }
}
