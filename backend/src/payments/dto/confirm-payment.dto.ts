// src/payments/dto/confirm-payment.dto.ts
import { IsString, Length, IsNumberString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsNumberString()
  @Length(16, 16)
  cardNumber: string;

  @IsNumberString()
  @Length(3, 3)
  cvv: string;

  @IsString()
  exp: string; // MM/YY
}
