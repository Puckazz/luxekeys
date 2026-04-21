import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProductStatus, ProductType } from '../../../generated/prisma/index.js';

export class CreateProductDto {
  @ApiProperty({ example: 'Keychron Q1 Pro' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'keychron-q1-pro' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

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

  @ApiProperty({ example: '199.99' })
  @IsDecimal({ decimal_digits: '0,2' })
  basePrice!: string;

  @ApiPropertyOptional({ example: '249.99' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  compareAtPrice?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.luxekeys.com/products/q1-pro.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
