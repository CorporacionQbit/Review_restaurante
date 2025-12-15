// src/restaurants/dto/filter-restaurants.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRestaurantsDto {
  // Texto para buscar en nombre o descripción
  @IsOptional()
  @IsString()
  search?: string;

  // Ciudad (ej: "Guatemala")
  @IsOptional()
  @IsString()
  city?: string;

  // Zona (ej: "10")
  @IsOptional()
  @IsString()
  zone?: string;

  // ejemplo nombre
  @IsOptional()
  @IsString()
  name?: string;

  // Rating mínimo 
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  // Precio máximo (1–5)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPriceRange?: number;

  // Solo premium o no
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPremium?: boolean;

 
  @IsOptional()
  @IsString()
  orderBy?: 'rating' | 'reviews' | 'price' | 'name';
}
