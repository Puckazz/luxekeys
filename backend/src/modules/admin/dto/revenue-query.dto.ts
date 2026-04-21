import { IsOptional, IsString } from 'class-validator';

export class RevenueQueryDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'month';
}
