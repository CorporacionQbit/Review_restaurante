import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  BadRequestException,
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
    return this.service.getMySubscription(req.user.userId);
  }

  // ===============================
  // Upgrade
  // ===============================
  @Patch('upgrade')
  async upgrade(
    @Req() req,
    @Body('restaurantId') restaurantId: number,
  ) {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }

    return this.service.upgrade(req.user.userId, restaurantId);
  }

  // ===============================
  // Downgrade
  // ===============================
  @Patch('downgrade')
  async downgrade(
    @Req() req,
    @Body('restaurantId') restaurantId: number,
  ) {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }

    return this.service.downgrade(req.user.userId, restaurantId);
  }

  // ===============================
  // Cancelar
  // ===============================
  @Patch('cancel')
  async cancel(
    @Req() req,
    @Body() dto: CancelSubscriptionDto & { restaurantId: number },
  ) {
    if (!dto.restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }

    return this.service.cancel(
      req.user.userId,
      dto.restaurantId,
      dto.reason || '',
    );
  }

  // ===============================
  // Reactivar
  // ===============================
  @Patch('reactivate')
  async reactivate(
    @Req() req,
    @Body('restaurantId') restaurantId: number,
  ) {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }

    return this.service.reactivate(req.user.userId, restaurantId);
  }

  // ===============================
  // Historial
  // ===============================
  @Get('history')
  async getHistory(@Req() req) {
    return this.service.getHistoryByOwner(req.user.userId);
  }

  @Get('payments')
  async getPayments(@Req() req) {
    return this.service.getPaymentHistoryByOwner(req.user.userId);
  }

  @Get('details')
  async getDetails(@Req() req) {
    return this.service.getSubscriptionDetailsByOwner(req.user.userId);
  }
}
