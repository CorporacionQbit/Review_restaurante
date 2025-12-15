import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
} from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  
  // Suscripción actual

  @Get('my')
  async mySubscription(@Req() req) {
    return this.service.getMySubscription(req.user.userId);
  }

  
  // Upgrade

  @Patch('upgrade')
  async upgrade(@Req() req) {
    return this.service.upgrade(req.user.userId);
  }

 
  // Downgrade
 
  @Patch('downgrade')
  async downgrade(@Req() req) {
    return this.service.downgrade(req.user.userId);
  }

  
  // Cancelar
 
  @Patch('cancel')
  async cancel(@Req() req, @Body() dto: CancelSubscriptionDto) {
    return this.service.cancel(req.user.userId, dto.reason || '');
  }


  // Reactivar
  
  @Patch('reactivate')
  async reactivate(@Req() req) {
    return this.service.reactivate(req.user.userId);
  }

  
  // Historial de planes

  @Get('history')
  async getHistory(@Req() req) {
    return this.service.getHistoryByOwner(req.user.userId);
  }

  
  // Historial de pagos

  @Get('payments')
  async getPayments(@Req() req) {
    return this.service.getPaymentHistoryByOwner(req.user.userId);
  }

  // Detalles completos

  @Get('details')
  async getDetails(@Req() req) {
    return this.service.getSubscriptionDetailsByOwner(req.user.userId);
  }
}
