import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './post.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

 
async create(ownerUserId: number, dto: CreatePostDto) {
  const restaurant = await this.restaurantRepo.findOne({
    where: {
      restaurantId: dto.restaurantId,
      ownerUserId,
    },
    relations: ['posts'],
  });

  if (!restaurant) {
    throw new NotFoundException('Restaurante no encontrado');
  }

  if (!restaurant.isPremium) {
    throw new ForbiddenException(
      'Solo restaurantes Premium pueden crear posts.',
    );
  }

  const activePosts = restaurant.posts.filter(p => p.isActive).length;

  if (activePosts >= 2) {
    throw new ForbiddenException(
      'Límite de 2 posts activos alcanzado para el plan Premium.',
    );
  }

  const post = this.postRepo.create({
    restaurant,
    title: dto.title,
    content: dto.content,
    imageUrl: dto.imageUrl,
    isActive: true,
  });

  return this.postRepo.save(post);
}


  // ACTUALIZAR POST solo dueño 
 
  async update(id: number, ownerUserId: number, dto: UpdatePostDto) {
    const post = await this.postRepo.findOne({
      where: { postId: id },
      relations: ['restaurant'],
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado.');
    }

    if (post.restaurant.ownerUserId !== ownerUserId) {
      throw new ForbiddenException(
        'No puedes actualizar un post que no pertenece a tu restaurante.',
      );
    }

    if (!post.restaurant.isPremium) {
      throw new ForbiddenException(
        'Solo restaurantes Premium pueden gestionar posts.',
      );
    }

    // Si se quiere activar un post, validar límite
    if (dto.isActive === true) {
      const activeCount = await this.postRepo.count({
        where: {
          restaurant: { restaurantId: post.restaurant.restaurantId },
          isActive: true,
        },
      });

      if (activeCount >= 2) {
        throw new ForbiddenException(
          'No puedes activar más de 2 posts simultáneamente.',
        );
      }
    }

    Object.assign(post, {
      title: dto.title ?? post.title,
      content: dto.content ?? post.content,
      imageUrl: dto.imageUrl ?? post.imageUrl,
      isActive: dto.isActive ?? post.isActive,
    });

    return this.postRepo.save(post);
  }


  // ELIMINAR POST solo dueño 
// DESACTIVAR POST (soft delete)
async delete(id: number, ownerUserId: number) {
  const post = await this.postRepo.findOne({
    where: { postId: id },
    relations: ['restaurant'],
  });

  if (!post) {
    throw new NotFoundException('Post no encontrado.');
  }

  if (post.restaurant.ownerUserId !== ownerUserId) {
    throw new ForbiddenException(
      'No puedes eliminar este post.',
    );
  }

  // 🔴 NO eliminar, solo desactivar
  post.isActive = false;

  await this.postRepo.save(post);

  return { message: 'Post desactivado correctamente' };
}


  // LISTAR POSTS ACTIVOS POR RESTAURANTE metodo publico

  async findByRestaurant(restaurantId: number) {
    return this.postRepo.find({
      where: {
        restaurant: { restaurantId },
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }


  // ADMIN: LISTAR TODOS LOS POSTS

  async findAll() {
    return this.postRepo.find({
      relations: ['restaurant'],
      order: { createdAt: 'DESC' },
    });
  }
}
