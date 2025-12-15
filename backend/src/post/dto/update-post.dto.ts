// src/post/dto/update-post.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
