import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { Menu } from './menu.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Restaurant])
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
