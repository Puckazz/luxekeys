import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../../../common/decorators/index.js';
import {
  PaginationQueryDto,
  SortOrder,
} from '../../../common/dto/pagination-query.dto.js';

export type { SortOrder };

export const BRAND_SORT_FIELDS = ['createdAt', 'updatedAt', 'name'] as const;
export type BrandSortField = (typeof BRAND_SORT_FIELDS)[number];

export class GetBrandsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: BRAND_SORT_FIELDS,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(BRAND_SORT_FIELDS)
  sortBy?: BrandSortField;
}
