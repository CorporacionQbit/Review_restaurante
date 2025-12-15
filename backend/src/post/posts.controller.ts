import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  // Crea un post para el restaurante del owner logueado
  @HttpPost()
  create(@Req() req, @Body() dto: CreatePostDto) {
    // req.user viene del AuthMiddleware
    return this.service.create(req.user.userId, dto);
  }

  // dueño actualiza su post
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.service.update(Number(id), req.user.userId, dto);
  }

  // dueño  elimina su post
  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.service.delete(Number(id), req.user.userId);
  }

  //  ver posts de un restaurante
  @Get('restaurant/:id')
  getByRestaurant(@Param('id') id: string) {
    return this.service.findByRestaurant(Number(id));
  }

  // Admin puede ver todos los post
  @Get()
  getAll() {
    return this.service.findAll();
  }
}