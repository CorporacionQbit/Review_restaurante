import { IsString } from 'class-validator';

export class ReportReviewDto {
  @IsString()
  reason: string;
}
