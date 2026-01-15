// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';

@Module({
   imports: [
    TypeOrmModule.forFeature([User]),
    RestaurantsModule, 
  ],
  providers: [UsersService],
  controllers: [UsersController],
  
  exports: [UsersService],
})
export class UsersModule {}
