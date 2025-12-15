import { IsString, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  menuUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}
