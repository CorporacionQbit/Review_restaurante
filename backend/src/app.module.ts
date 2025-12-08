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
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    // Cargar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuración de TypeORM con PostgreSQL
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

    UsersModule,
    AuthModule,
    RestaurantsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        // Rutas de usuarios protegidas
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/me', method: RequestMethod.ALL },
        { path: 'users/:id', method: RequestMethod.ALL },

        // Rutas de restaurantes protegidas
        { path: 'restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/my-restaurants', method: RequestMethod.ALL },
        { path: 'restaurants/:id', method: RequestMethod.ALL },
      );
   
  }
}
