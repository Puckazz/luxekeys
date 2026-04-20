import { IsOptional, IsString } from 'class-validator';

// Query DTO cho /admin/stats/revenue
export class RevenueQueryDto {
  @IsOptional()
  @IsString()
  fromDate?: string; // ISO 8601, e.g. "2025-01-01"

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'month'; // default: 'month'
}
