// src/restaurants/dto/update.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
