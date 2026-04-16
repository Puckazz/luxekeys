import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ProductType } from '../interfaces/product.interface';
import { PRODUCT_TYPES } from './product-dto.constants';

export const PRODUCT_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'name',
  'price',
  'stock',
  'brand',
  'category',
] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
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

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 12,
    minimum: 1,
    description: 'Number of products per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 'wireless keyboard',
    description: 'Search by product name or keyword',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Logitech' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Mechanical Keyboard' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: PRODUCT_TYPES, example: PRODUCT_TYPES[0] })
  @IsOptional()
  @IsEnum(PRODUCT_TYPES)
  type?: ProductType;

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 300, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: PRODUCT_SORT_FIELDS,
    example: 'createdAt',
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(PRODUCT_SORT_FIELDS)
  sortBy?: ProductSortField;

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    example: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SORT_ORDERS)
  sortOrder?: SortOrder;
}
