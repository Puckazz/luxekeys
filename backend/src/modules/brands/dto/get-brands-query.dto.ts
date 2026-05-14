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

export const ADMIN_BRAND_STATUS_FILTERS = [
  'active',
  'draft',
  'archived',
] as const;
export type AdminBrandStatusFilter =
  (typeof ADMIN_BRAND_STATUS_FILTERS)[number];

export const ADMIN_BRAND_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'products-desc',
] as const;
export type AdminBrandSortOption = (typeof ADMIN_BRAND_SORT_OPTIONS)[number];

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

export class GetAdminBrandsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_BRAND_STATUS_FILTERS,
    description: 'Filter by admin status',
  })
  @IsOptional()
  @IsEnum(ADMIN_BRAND_STATUS_FILTERS)
  status?: AdminBrandStatusFilter;

  @ApiPropertyOptional({
    enum: ADMIN_BRAND_SORT_OPTIONS,
    description: 'Admin sort option',
  })
  @IsOptional()
  @IsEnum(ADMIN_BRAND_SORT_OPTIONS)
  sort?: AdminBrandSortOption;
}
