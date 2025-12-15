// src/reviews/reviews.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './review.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { ReviewReport } from './review-report.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(ReviewReport)
    private readonly reportRepo: Repository<ReviewReport>,
  ) {}


  // Crear reseña (con trigger de 4 días)
  async createReview(
    userId: number,
    restaurantId: number,
    dto: CreateReviewDto,
  ) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const review = this.reviewRepo.create({
      userId,
      restaurantId,
      rating: dto.rating,
      reviewText: dto.reviewText ?? null,
      status: 'Pendiente', 
    });

    try {
      return await this.reviewRepo.save(review);
    } catch (e) {
      if (e.message.includes('debe esperar 4 días')) {
        throw new ForbiddenException(
          'Debes esperar 4 días antes de volver a reseñar este restaurante.',
        );
      }
      throw e;
    }
  }


  // Obtener reseñas de un restaurante (por rol)
  
  async getRestaurantReviews(
    restaurantId: number,
    role?: string,
    userId?: number,
  ) {
    // Admin ve todo
    if (role === 'admin') {
      return this.reviewRepo.find({
        where: { restaurantId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    }

    // Dueño ve todo
    if (role === 'owner') {
      const ownRestaurant = await this.restaurantRepo.count({
        where: { restaurantId, ownerUserId: userId },
      });

      if (ownRestaurant > 0) {
        return this.reviewRepo.find({
          where: { restaurantId },
          relations: ['user'],
          order: { createdAt: 'DESC' },
        });
      }
    }

    // Cliente ve reseñas sin filtrar
    return this.reviewRepo.find({
      where: { restaurantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  
  // Obtener reseñas del usuario
  
  async getUserReviews(userId: number) {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['restaurant'],
      order: { createdAt: 'DESC' },
    });
  }

  
  // Actualizar reseña (solo autor)
  
  async updateReview(
    reviewId: number,
    userId: number,
    dto: UpdateReviewDto,
  ) {
    const review = await this.reviewRepo.findOne({ where: { reviewId } });

    if (!review) throw new NotFoundException('Reseña no encontrada');

    if (review.userId !== userId) {
      throw new ForbiddenException('No puedes editar una reseña que no es tuya');
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.reviewText !== undefined) review.reviewText = dto.reviewText;

    return this.reviewRepo.save(review);
  }


  // Eliminar reseña (solo autor)
  
  async deleteReview(reviewId: number, userId: number) {
    const review = await this.reviewRepo.findOne({ where: { reviewId } });

    if (!review) throw new NotFoundException('Reseña no encontrada');

    if (review.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar esta reseña');
    }

    await this.reviewRepo.remove(review);

    return { success: true };
  }


  // REPORTAR RESEÑA (dueño)

  async reportReview(reviewId: number, ownerId: number, reason: string) {
    const review = await this.reviewRepo.findOne({
      where: { reviewId },
      relations: ['restaurant'],
    });

    if (!review) throw new NotFoundException('Reseña no encontrada');

    // Validar que el dueño es quien reporta
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId: review.restaurantId },
    });

    if (!restaurant || restaurant.ownerUserId !== ownerId) {
      throw new ForbiddenException(
        'No puedes reportar reseñas de un restaurante que no administras',
      );
    }

    const report = this.reportRepo.create({
      reviewId,
      userId: ownerId,
      reason,
      isResolved: false,
    });

    return this.reportRepo.save(report);
  }

  
  // ADMIN: obtener todos los reportes
  
  async getReports() {
    return this.reportRepo.find({
      relations: ['review', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  
  // ADMIN: eliminar reseña reportada
 
  async adminDeleteReview(reviewId: number) {
    const review = await this.reviewRepo.findOne({ where: { reviewId } });

    if (!review) throw new NotFoundException('Reseña no encontrada');

    // Marcar reportes como resueltos
    await this.reportRepo.update(
      { reviewId },
      { isResolved: true },
    );

    await this.reviewRepo.remove(review);

    return { success: true };
  }

  
  // ADMIN: resolver reporte sin borrar reseña
 
  async resolveReport(reportId: number) {
    const report = await this.reportRepo.findOne({ where: { reportId } });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    report.isResolved = true;

    return this.reportRepo.save(report);
  }
}
