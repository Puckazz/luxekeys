import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../../../common/decorators';
import {
  PaginationQueryDto,
  SortOrder,
} from '../../../common/dto/pagination-query.dto';

export type { SortOrder };

export const CATEGORY_SORT_FIELDS = ['createdAt', 'updatedAt', 'name'] as const;
export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];

export const ADMIN_CATEGORY_STATUS_FILTERS = [
  'active',
  'draft',
  'archived',
] as const;
export type AdminCategoryStatusFilter =
  (typeof ADMIN_CATEGORY_STATUS_FILTERS)[number];

export const ADMIN_CATEGORY_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'products-desc',
] as const;
export type AdminCategorySortOption =
  (typeof ADMIN_CATEGORY_SORT_OPTIONS)[number];

export class GetCategoriesQueryDto extends PaginationQueryDto {
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
    enum: CATEGORY_SORT_FIELDS,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(CATEGORY_SORT_FIELDS)
  sortBy?: CategorySortField;
}

export class GetAdminCategoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, slug, or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_CATEGORY_STATUS_FILTERS,
    description: 'Filter by admin status',
  })
  @IsOptional()
  @IsEnum(ADMIN_CATEGORY_STATUS_FILTERS)
  status?: AdminCategoryStatusFilter;

  @ApiPropertyOptional({
    enum: ADMIN_CATEGORY_SORT_OPTIONS,
    description: 'Admin sort option',
  })
  @IsOptional()
  @IsEnum(ADMIN_CATEGORY_SORT_OPTIONS)
  sort?: AdminCategorySortOption;
}
