// src/reviews/reviews.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';

import type { AuthRequest } from '../auth/auth.middleware';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}


  // CREAR RESEÑA  (CLIENTE)


  @Post('restaurants/:restaurantId/reviews')
  async createReview(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateReviewDto,
  ) {
    if (!req.user || req.user.role !== 'client') {
      throw new ForbiddenException('Solo clientes pueden crear reseñas');
    }

    return this.reviewsService.createReview(
      req.user.userId,
      Number(restaurantId),
      dto,
    );
  }


  // OBTENER RESEÑAS DE UN RESTAURANTE
 
  @Get('restaurants/:restaurantId/reviews')
  async getRestaurantReviews(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.reviewsService.getRestaurantReviews(
      Number(restaurantId),
      req.user?.role,
      req.user?.userId,
    );
  }

 
  // OBTENER RESEÑAS DEL USUARIO LOGUEADO
 

  @Get('users/me/reviews')
  async getMyReviews(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.reviewsService.getUserReviews(req.user.userId);
  }

 
  // ACTUALIZAR RESEÑA  (AUTOR)
  
 
  @Patch('reviews/:id')
  async updateReview(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    if (!req.user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.reviewsService.updateReview(
      Number(id),
      req.user.userId,
      dto,
    );
  }

 
  // ELIMINAR RESEÑA  (AUTOR)

 
  @Delete('reviews/:id')
  async deleteReview(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ) {
    if (!req.user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.reviewsService.deleteReview(
      Number(id),
      req.user.userId,
    );
  }

 
  // REPORTAR RESEÑA (DUEÑO)
  // POST /reviews/:id/report

@Post('reviews/:id/report')
async reportReview(
  @Req() req: AuthRequest,
  @Param('id') id: string,
  @Body() dto: ReportReviewDto,
) {
  console.log('REQ USER:', req.user);

  if (!req.user || req.user.role !== 'owner') {
    throw new ForbiddenException('Solo dueños pueden reportar reseñas');
  }

  return this.reviewsService.reportReview(
    Number(id),
    req.user.userId,
    dto.reason,
  );
}

  // ADMIN: OBTENER TODOS LOS REPORTES
  // GET /admin/review-reports
 
  @Get('admin/review-reports')
  async getReports(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden ver reportes');
    }

    return this.reviewsService.getReports();
  }

  // ADMIN: ELIMINAR RESEÑA REPORTADA
  // DELETE /admin/reviews/:id
 
  @Delete('admin/reviews/:id')
  async deleteReviewAdmin(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden eliminar reseñas');
    }

    return this.reviewsService.adminDeleteReview(Number(id));
  }

 
  // ADMIN: RESOLVER REPORTE SIN ELIMINAR RESEÑA
  // PATCH /admin/review-reports/:id/resolve
 
  @Patch('admin/review-reports/:id/resolve')
  async resolveReport(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden resolver reportes');
    }

    return this.reviewsService.resolveReport(Number(id));
  }
  // ================================
// ADMIN: RESEÑAS PENDIENTES
// ================================

// GET /admin/reviews/pending
@Get('admin/reviews/pending')
async getPendingReviews(@Req() req: AuthRequest) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.reviewsService.getPendingReviews();
}
@Patch('admin/reviews/:id/approve')
async approveReview(
  @Req() req: AuthRequest,
  @Param('id') id: string,
) {
  console.log('REQ.USER =>', req.user); // 👈 CLAVE

  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.reviewsService.approveReview(
    Number(id),
    req.user.userId,
  );
}

@Patch('admin/reviews/:id/reject')
async rejectReview(
  @Req() req: AuthRequest,
  @Param('id') id: string,
  @Body() body: { reason: string },
) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.reviewsService.rejectReview(
    Number(id),
    body.reason,
    req.user.userId,
  );
}
@Get('admin/reviews/moderation-history')
async getModerationHistory(@Req() req: AuthRequest) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenException('Solo administradores');
  }

  return this.reviewsService.getModerationHistory();
}

}
