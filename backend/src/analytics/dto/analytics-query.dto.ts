import { IsOptional, IsIn } from 'class-validator';

export class AnalyticsRangeDto {
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  range?: '7d' | '30d' | '90d' = '7d';
}
