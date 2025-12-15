// src/payments/payments.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post(':id/confirm')
  confirmPayment(
    @Param('id') id: number,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.service.confirmPayment(id, dto);
  }
}
