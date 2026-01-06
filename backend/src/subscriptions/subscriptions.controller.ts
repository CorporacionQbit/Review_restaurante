import {
  Controller,
  Get,
  Patch,
  Req,
  Body,
  UnauthorizedException,
} from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  // ===============================
  // Suscripción actual
  // ===============================
  @Get('my')
  async mySubscription(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.service.getMySubscription(req.user.userId);
  }

  // ===============================
  // Upgrade
  // ===============================
  @Patch('upgrade')
  upgrade(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.service.upgrade(req.user.userId);
  }

  // ===============================
  // Downgrade
  // ===============================
  @Patch('downgrade')
  downgrade(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.service.downgrade(req.user.userId);
  }

  // ===============================
  // Cancelar
  // ===============================
  @Patch('cancel')
  cancel(
    @Req() req,
    @Body() dto: CancelSubscriptionDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.service.cancel(
      req.user.userId,
      dto.reason || '',
    );
  }
}
