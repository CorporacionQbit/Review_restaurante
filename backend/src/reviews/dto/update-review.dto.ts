// src/reviews/dto/update-review.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional()
  @IsIn(['Pendiente', 'Aprobada', 'Rechazada'])
  status?: 'Pendiente' | 'Aprobada' | 'Rechazada';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
