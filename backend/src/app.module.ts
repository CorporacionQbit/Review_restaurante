// src/app.module.ts
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ===== MÓDULOS =====
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MenusModule } from './menu/menus.module';
import { PostsModule } from './post/posts.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

// ===== MIDDLEWARE =====
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    // ===== CONFIG =====
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ===== DATABASE =====
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

    // ===== FEATURE MODULES =====
    UsersModule,
    AuthModule,
    RestaurantsModule,
    ReviewsModule,
    MenusModule,
    PostsModule,
    SubscriptionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)

      // =========================
      // 🔓 RUTAS PÚBLICAS (SIN TOKEN)
      // =========================
      .exclude(
        // AUTH
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/google', method: RequestMethod.GET },
        { path: 'auth/google/callback', method: RequestMethod.GET },

        // RESTAURANTES PÚBLICOS
        { path: 'restaurants/search', method: RequestMethod.GET },
        { path: 'restaurants/:id', method: RequestMethod.GET },
        { path: 'restaurants/:restaurantId/reviews', method: RequestMethod.GET },
      )

      // =========================
      // 🔒 RUTAS PROTEGIDAS (CON TOKEN)
      // =========================
      .forRoutes(
        // ===== USERS =====
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/me', method: RequestMethod.ALL },
        { path: 'users/me/convert-to-owner', method: RequestMethod.ALL },
        { path: 'users/me/reviews', method: RequestMethod.ALL },
        { path: 'users/:id', method: RequestMethod.ALL },

        // ===== RESTAURANTS =====
        { path: 'restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/my-restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/:id/images', method: RequestMethod.ALL },
        { path: 'restaurants/:id/validate', method: RequestMethod.ALL },

        // ===== REVIEWS (🔥 CLAVE) =====
        // 👉 ESTA ERA LA QUE FALTABA
        { path: 'restaurants/:restaurantId/reviews', method: RequestMethod.POST },
        { path: 'reviews/:id', method: RequestMethod.ALL },
        { path: 'reviews/:id/report', method: RequestMethod.ALL },

        // ===== ADMIN =====
        { path: 'admin/review-reports', method: RequestMethod.ALL },
        { path: 'admin/reviews/:id', method: RequestMethod.ALL },
        { path: 'admin/review-reports/:id/resolve', method: RequestMethod.ALL },

        // ===== POSTS =====
        { path: 'posts', method: RequestMethod.ALL },
        { path: 'posts/:id', method: RequestMethod.ALL },
        { path: 'posts/restaurant/:id', method: RequestMethod.ALL },

        // ===== MENÚS =====
        { path: 'restaurants/:id/menu', method: RequestMethod.ALL },
        { path: 'menu/:menuId', method: RequestMethod.ALL },

        // ===== SUBSCRIPTIONS =====
        { path: 'subscriptions', method: RequestMethod.ALL },
        { path: 'subscriptions/my', method: RequestMethod.ALL },
        { path: 'subscriptions/upgrade', method: RequestMethod.ALL },
        { path: 'subscriptions/downgrade', method: RequestMethod.ALL },
        { path: 'subscriptions/cancel', method: RequestMethod.ALL },
        { path: 'subscriptions/reactivate', method: RequestMethod.ALL },
        { path: 'subscriptions/history', method: RequestMethod.ALL },
        { path: 'subscriptions/payments', method: RequestMethod.ALL },
        { path: 'subscriptions/details', method: RequestMethod.ALL },
      );
  }
}
