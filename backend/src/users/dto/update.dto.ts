// src/users/dto/update-user.dto.ts
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
