import { IsNumber } from 'class-validator';

export class UpgradePlanDto {
  @IsNumber()
  restaurantId: number;
}

