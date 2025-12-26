import { IsInt, IsPositive } from 'class-validator';

export class RemoveFavoriteDto {
  @IsInt()
  @IsPositive()
  restaurantId: number;
}
