// src/subscriptions/dto/cancel-subscription.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
