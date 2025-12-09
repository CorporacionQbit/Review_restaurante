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

  // Rating mínimo (ej: 4, 4.5, etc.)
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

  /**
   * Cómo ordenar:
   *  - "rating"  => r.avgRating DESC
   *  - "reviews" => r.totalReviews DESC
   *  - "price"   => r.priceRange ASC
   *  - "name"    => r.name ASC (default)
   */
  @IsOptional()
  @IsString()
  orderBy?: 'rating' | 'reviews' | 'price' | 'name';
}
