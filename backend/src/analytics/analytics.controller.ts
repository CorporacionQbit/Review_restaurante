import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { AuthRequest } from '../auth/auth.middleware';
import { AnalyticsRangeDto } from './dto/analytics-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('restaurants/:restaurantId/summary')
  async getSummary(
    @Param('restaurantId') restaurantId: string,
    @Req() req: AuthRequest,
    @Query() query: AnalyticsRangeDto,
  ) {
    return this.analyticsService.getRestaurantSummary(
      Number(restaurantId),
      req.user!.userId,
      query.range ?? '7d',
    );
  }
  
 @Get('restaurants/:restaurantId/timeline')
async getTimeline(
  @Param('restaurantId') restaurantId: string,
  @Query() query: AnalyticsRangeDto,
  @Req() req: AuthRequest,
) {
  return this.analyticsService.getRestaurantTimeline(
    Number(restaurantId),
    req.user!.userId,
    query.range ?? '7d',
  );
}

  @Get('owner/summary')
async getOwnerSummary(
  @Req() req: AuthRequest,
  @Query() query: AnalyticsRangeDto,
) {
  return this.analyticsService.getOwnerSummary(
    req.user!.userId,
    query.range ?? '7d',
  );
}


}

