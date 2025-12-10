// src/app.module.ts
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReviewsModule } from './reviews/reviews.module';

import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    // Módulos
    UsersModule,
    AuthModule,
    RestaurantsModule,
    ReviewsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        // ======================================================
        // USERS PROTEGIDOS
        // ======================================================
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/me', method: RequestMethod.ALL },
        { path: 'users/:id', method: RequestMethod.ALL },

        // ======================================================
        // RESTAURANTS PROTEGIDOS
        // ======================================================
        { path: 'restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/my-restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/:id', method: RequestMethod.ALL },
        { path: 'restaurants/:id/images', method: RequestMethod.ALL },
        { path: 'restaurants/:restaurantId/reviews', method: RequestMethod.ALL },

        // ======================================================
        // REVIEWS PROTEGIDOS
        // ======================================================
        { path: 'reviews', method: RequestMethod.ALL },
        { path: 'reviews/:id', method: RequestMethod.ALL },

        // *** IMPORTANTE: REPORTAR RESEÑA ***
        { path: 'reviews/:id/report', method: RequestMethod.ALL },

        // ======================================================
        // ADMIN PROTEGIDOS
        // ======================================================
        { path: 'admin/review-reports', method: RequestMethod.ALL },
        { path: 'admin/reviews/:id', method: RequestMethod.ALL },
        { path: 'admin/review-reports/:id/resolve', method: RequestMethod.ALL },
      );
    // Las rutas /auth/* son públicas (login/register)
  }
}
