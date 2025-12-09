import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { AuthRequest } from '../auth/auth.middleware';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateReviewDto) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.reviewsService.create(req.user.userId, dto);
  }

  @Get('restaurant/:id')
  async getByRestaurant(@Param('id') id: string) {
    return this.reviewsService.findApprovedByRestaurant(Number(id));
  }

  @Get('me')
  async myReviews(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.reviewsService.findByUser(req.user.userId);
  }
}
