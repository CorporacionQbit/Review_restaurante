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
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './category/categories.module';
// ===== MIDDLEWARE =====
import { AuthMiddleware } from './auth/auth.middleware';
import { FavoritesModule } from './favorites/favorites.module';

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
    FavoritesModule,
    AnalyticsModule,
    AdminModule,
    CategoriesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)

      // =========================
      // 🔓 RUTAS PÚBLICAS
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
         { path: 'categories', method: RequestMethod.GET },
)
      

      // =========================
      // 🔒 RUTAS PROTEGIDAS
      // =========================
      .forRoutes(
        // ===== ADMIN CATEGORIES =====
{ path: 'admin/categories', method: RequestMethod.ALL },
{ path: 'admin/categories/:id', method: RequestMethod.ALL },

        // ===== FAVORITES (🔥 CLAVE) =====
        { path: 'favorites', method: RequestMethod.ALL },
        { path: 'favorites/:id', method: RequestMethod.ALL }, // 
        // ===== USERS =====
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/me', method: RequestMethod.ALL },
        { path: 'users/me/convert-to-owner', method: RequestMethod.ALL },
        { path: 'users/me/reviews', method: RequestMethod.ALL },
        { path: 'users/:id', method: RequestMethod.ALL },

        // ===== RESTAURANTS =====
        { path: 'restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/:id', method: RequestMethod.ALL },
         { path: 'restaurants/owner/my-restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/my-restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/:id/images', method: RequestMethod.ALL },
        { path: 'restaurants/:id/validate', method: RequestMethod.ALL },

        // ===== REVIEWS =====
        { path: 'restaurants/:restaurantId/reviews', method: RequestMethod.POST },
        { path: 'reviews/:id', method: RequestMethod.ALL },
        { path: 'reviews/:id/report', method: RequestMethod.ALL },

        // ===== ADMIN =====
 // ===== ADMIN =====
{ path: 'admin/dashboard', method: RequestMethod.ALL },
{ path: 'admin/dashboard/metrics', method: RequestMethod.ALL },

{ path: 'admin/categories', method: RequestMethod.ALL },
{ path: 'admin/categories/:id', method: RequestMethod.ALL },

{ path: 'admin/review-reports', method: RequestMethod.ALL },
{ path: 'admin/reviews/:id', method: RequestMethod.ALL },
{ path: 'admin/review-reports/:id/resolve', method: RequestMethod.ALL },
{ path: 'admin/reviews/pending', method: RequestMethod.ALL },
{ path: 'admin/reviews/moderation-history', method: RequestMethod.ALL },
{ path: 'admin/reviews/:id/approve', method: RequestMethod.ALL },
{ path: 'admin/reviews/:id/reject', method: RequestMethod.ALL },



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
        // ===== ANALYTICS =====
{ path: 'analytics', method: RequestMethod.ALL },
{ path: 'analytics/*path', method: RequestMethod.ALL },


      );
  }
}


