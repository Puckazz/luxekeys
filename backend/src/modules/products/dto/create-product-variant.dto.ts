import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'Q1P-BLK-75-BROWN' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  sku!: string;

  @ApiProperty({ example: 'Black / 75% / Gateron Brown' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: '199.99' })
  @IsDecimal({ decimal_digits: '0,2' })
  price!: string;

  @ApiPropertyOptional({ example: '229.99' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  compareAtPrice?: string;

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

  @ApiPropertyOptional({ example: 'Gateron Brown' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  switchType?: string;

  @ApiPropertyOptional({ example: 'Wireless' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  connectivity?: string;

  @ApiPropertyOptional({ example: 10, default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
