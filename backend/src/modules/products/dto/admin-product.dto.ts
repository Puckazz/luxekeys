import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ProductStatus, ProductType } from '../../../generated/prisma/index.js';

export const ADMIN_PRODUCT_STATUS_FILTERS = [
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
  'OUT_OF_STOCK',
] as const;

export type AdminProductStatusFilter =
  (typeof ADMIN_PRODUCT_STATUS_FILTERS)[number];

export const ADMIN_PRODUCT_SORT_FIELDS = [
  'createdAt',
  'name',
  'stock',
  'basePrice',
] as const;

export type AdminProductSortField = (typeof ADMIN_PRODUCT_SORT_FIELDS)[number];

export const ADMIN_INVENTORY_STATUS_FILTERS = [
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
] as const;

export type AdminInventoryStatusFilter =
  (typeof ADMIN_INVENTORY_STATUS_FILTERS)[number];

export const ADMIN_INVENTORY_SORT_FIELDS = [
  'updatedAt',
  'name',
  'stock',
] as const;

export type AdminInventorySortField =
  (typeof ADMIN_INVENTORY_SORT_FIELDS)[number];

export class GetAdminProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product name, description or SKU',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Filter by catalog category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ADMIN_PRODUCT_STATUS_FILTERS })
  @IsOptional()
  @IsIn(ADMIN_PRODUCT_STATUS_FILTERS)
  status?: AdminProductStatusFilter;

  @ApiPropertyOptional({ enum: ADMIN_PRODUCT_SORT_FIELDS })
  @IsOptional()
  @IsIn(ADMIN_PRODUCT_SORT_FIELDS)
  sortBy?: AdminProductSortField;
}

export class GetAdminInventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product name, description, SKU or variant fields',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Filter by catalog category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ADMIN_INVENTORY_STATUS_FILTERS })
  @IsOptional()
  @IsIn(ADMIN_INVENTORY_STATUS_FILTERS)
  status?: AdminInventoryStatusFilter;

  @ApiPropertyOptional({ enum: ADMIN_INVENTORY_SORT_FIELDS })
  @IsOptional()
  @IsIn(ADMIN_INVENTORY_SORT_FIELDS)
  sortBy?: AdminInventorySortField;
}

export class AdminProductSwitchOptionInputDto {
  @ApiPropertyOptional({ example: 'uuid-of-existing-switch-option' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Gateron Yellow Pro' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Linear' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  switchType!: string;

  @ApiPropertyOptional({ example: 249.99, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number | null;

  @ApiProperty({ example: 199.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class AdminProductSpecInputDto {
  @ApiPropertyOptional({ example: 'uuid-of-existing-spec' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Layout' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  specKey!: string;

  @ApiProperty({ example: 'TKL (80%)' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  specValue!: string;

  @ApiPropertyOptional({ example: 'General' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  groupName?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class AdminProductVariantInputDto {
  @ApiPropertyOptional({ example: 'uuid-of-existing-variant' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ example: 'uuid-of-product-image' })
  @IsOptional()
  @IsUUID()
  thumbnailImageId?: string;

  @ApiPropertyOptional({ example: 'Q1P-BLK-BROWN' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  sku?: string;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  color?: string;

  @ApiPropertyOptional({ example: '75%' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  layout?: string;

  @ApiProperty({ example: 'Gateron Brown' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  switchType?: string;

  @ApiPropertyOptional({ example: 249.99, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number | null;

  @ApiProperty({ example: 199.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [AdminProductSwitchOptionInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminProductSwitchOptionInputDto)
  switchOptions?: AdminProductSwitchOptionInputDto[];
}

export class UpsertAdminProductDto {
  @ApiProperty({ example: 'Keychron Q1 Pro' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Gasket-mounted wireless mechanical keyboard.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Full product description in markdown...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductType, example: ProductType.KEYBOARD })
  @IsEnum(ProductType)
  type!: ProductType;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'uuid-of-brand' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.luxekeys.com/products/q1-pro.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['wireless', 'gasket mount', 'hot swap'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [AdminProductSpecInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminProductSpecInputDto)
  specs?: AdminProductSpecInputDto[];

  @ApiProperty({ type: [AdminProductVariantInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminProductVariantInputDto)
  variants!: AdminProductVariantInputDto[];
}

export class AdminInventoryBulkUpdateItemDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 'uuid-of-variant' })
  @IsUUID()
  variantId!: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}

export class AdminInventoryBulkUpdateDto {
  @ApiProperty({ type: [AdminInventoryBulkUpdateItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminInventoryBulkUpdateItemDto)
  updates!: AdminInventoryBulkUpdateItemDto[];
}
