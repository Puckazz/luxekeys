import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ProductStatus, ProductType } from '../../../generated/prisma/index.js';
import { ToBoolean } from '../../../common/decorators';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export const PRODUCT_SORT_FIELDS = ['createdAt', 'basePrice', 'name'] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

const parseStringListQueryParam = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export class GetProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ProductType,
    description: 'Filter by product type',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseStringListQueryParam(value))
  @IsEnum(ProductType, { each: true })
  type?: ProductType[];

  @ApiPropertyOptional({
    enum: ProductStatus,
    description: 'Filter by product status',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filter by brand UUIDs',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseStringListQueryParam(value))
  @IsUUID('4', { each: true })
  brandId?: string[];

  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category slugs',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseStringListQueryParam(value))
  @IsString({ each: true })
  categorySlug?: string[];

  @ApiPropertyOptional({
    description: 'Filter by variant layout',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseStringListQueryParam(value))
  @IsString({ each: true })
  layout?: string[];

  @ApiPropertyOptional({
    description: 'Filter by variant switch type',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => parseStringListQueryParam(value))
  @IsString({ each: true })
  switchType?: string[];

  @ApiPropertyOptional({ description: 'Filter featured products' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Minimum base price', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum base price', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PRODUCT_SORT_FIELDS, description: 'Sort field' })
  @IsOptional()
  @IsEnum(PRODUCT_SORT_FIELDS)
  sortBy?: ProductSortField;
}
