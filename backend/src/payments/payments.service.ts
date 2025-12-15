// src/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payments.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
  ) {}


  // VALIDACIÓN LUHN

  private validateLuhn(card: string): boolean {
    let sum = 0;
    let toggle = false;

    for (let i = card.length - 1; i >= 0; i--) {
      let digit = parseInt(card[i]);

      if (toggle) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      toggle = !toggle;
    }

    return sum % 10 === 0;
  }


  // REGLAS DE TARJETAS SIMULADAS
  private simulateStripeResponse(cardNumber: string) {
    switch (cardNumber) {
      case '4242424242424242':
        return { status: 'PAID' };

      case '4000000000009995':
        throw new BadRequestException('Pago rechazado por el banco.');

      case '4000000000000069':
        throw new BadRequestException('Fondos insuficientes.');

      case '4000000000000127':
        throw new BadRequestException('Tarjeta expirada.');

      case '4000000000000119':
        throw new BadRequestException('Error de autenticación de tarjeta.');

      default:
        return { status: 'PAID' }; // cualquier otra pasa
    }
  }

  // CONFIRMAR PAGO
  async confirmPayment(paymentId: number, dto: ConfirmPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { paymentId },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Pago ya fue procesado.');
    }

    // Validación Luhn
    if (!this.validateLuhn(dto.cardNumber)) {
      throw new BadRequestException('Número de tarjeta inválido.');
    }

    // Validación avanzada estilo Stripe
    const result = this.simulateStripeResponse(dto.cardNumber);

    // actualizar pago 
    payment.status = 'PAID';
    payment.paymentMethod = 'CARD';
    payment.transactionReference = 'TX-' + Math.random().toString(36).substring(2, 10);
    payment.paidAt = new Date();

    await this.paymentRepo.save(payment);

    // Activamos suscripción
    const sub = payment.subscription;
    sub.isActive = true;
    await this.subRepo.save(sub);

    return {
      message: 'Pago realizado con éxito.',
      status: payment.status,
      reference: payment.transactionReference,
    };
  }
}
