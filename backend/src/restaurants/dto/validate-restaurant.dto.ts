// src/restaurants/dto/validate-restaurant.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ValidateRestaurantDto {
  @IsBoolean()
  isApproved: boolean; // true = aprobado, false = rechazado

  @IsOptional()
  @IsString()
  onboardingComment?: string;

  // Opcional: marcar si será premium o no
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
