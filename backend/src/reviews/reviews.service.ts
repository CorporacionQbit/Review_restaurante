import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './review.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  // ==========================
  // CREAR RESEÑA
  // ==========================
  async create(userId: number, dto: CreateReviewDto) {
    const { restaurantId, rating, reviewText } = dto;

    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    if (!restaurant.isApproved) {
      throw new BadRequestException(
        'No puedes reseñar un restaurante no aprobado',
      );
    }

    // Regla: 1 reseña cada 4 días
    const lastReview = await this.reviewRepo.findOne({
      where: { restaurantId, userId },
      order: { createdAt: 'DESC' },
    });

    if (lastReview) {
      const diffDays =
        (Date.now() - lastReview.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays < 4) {
        throw new BadRequestException(
          'Solo puedes dejar una reseña cada 4 días para este restaurante',
        );
      }
    }

    const review = this.reviewRepo.create({
      restaurantId,
      userId,
      rating,
      reviewText: reviewText ?? null,
      status: 'Pendiente',
    });

    return this.reviewRepo.save(review);
  }

  // ==========================
  // RESEÑAS APROBADAS DEL RESTAURANTE
  // ==========================
  async findApprovedByRestaurant(restaurantId: number) {
    return this.reviewRepo.find({
      where: {
        restaurantId,
        status: 'Aprobada',
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================
  // RESEÑAS DEL USUARIO
  // ==========================
  async findByUser(userId: number) {
    return this.reviewRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
