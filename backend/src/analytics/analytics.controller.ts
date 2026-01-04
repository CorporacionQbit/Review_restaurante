import { Controller, Get, Param, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { AuthRequest } from '../auth/auth.middleware';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('restaurants/:restaurantId/summary')
  async getSummary(
    @Param('restaurantId') restaurantId: string,
    @Req() req: AuthRequest,
  ) {
    return this.analyticsService.getRestaurantSummary(
      Number(restaurantId),
      req.user!.userId,
    );
  }
}

