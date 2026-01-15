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

  async register(email: string, password: string, fullName: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

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

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
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

  async loginRestaurant(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
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

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: user.role === 'admin' ? 'admin' : 'owner',
      isRestaurantOwner: true,
      restaurantIds: restaurants.map(r => r.restaurantId),
    });

    return {
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
      },
      restaurants,
      accessToken: token,
    };
  }

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

  async loginWithGoogle(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
  }) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.createUser({
        email: googleUser.email,
        passwordHash: '',
        fullName: `${googleUser.firstName} ${googleUser.lastName}`,
      });

      user.role = 'client';
      await this.usersService.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
    }

    const token = await this.signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
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
}
