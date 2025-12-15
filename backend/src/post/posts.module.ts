import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Restaurant])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
