import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const ADMIN_STATS_PERIODS = ['7d', '30d', '90d'] as const;
export type AdminStatsPeriod = (typeof ADMIN_STATS_PERIODS)[number];

export class AdminStatsPeriodQueryDto {
  @ApiPropertyOptional({
    enum: ADMIN_STATS_PERIODS,
    default: '30d',
    description: 'Dashboard reporting period',
  })
  @IsOptional()
  @IsIn(ADMIN_STATS_PERIODS)
  period?: AdminStatsPeriod;
}

export class AdminTopProductsQueryDto extends AdminStatsPeriodQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 12,
    default: 4,
    description: 'Maximum number of top products to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number;
}
