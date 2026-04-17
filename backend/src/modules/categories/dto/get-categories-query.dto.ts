import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const CATEGORY_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'name',
  'productCount',
] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return value;
};

export class GetCategoriesQueryDto {
  @ApiPropertyOptional({ minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name, slug, or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: CATEGORY_SORT_FIELDS,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(CATEGORY_SORT_FIELDS)
  sortBy?: CategorySortField;

  @ApiPropertyOptional({ enum: SORT_ORDERS, description: 'Sort direction' })
  @IsOptional()
  @IsEnum(SORT_ORDERS)
  sortOrder?: SortOrder;
}
