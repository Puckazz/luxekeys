import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import type { ProductType } from '../interfaces/product.interface';
import { AccessoryDetailsDto } from './accessory-details.dto';
import { KeyboardDetailsDto } from './keyboard-details.dto';
import { KeycapDetailsDto } from './keycap-details.dto';
import { PRODUCT_TYPES } from './product-dto.constants';
import { ProductVariantDto } from './product-variant.dto';
import { SwitchDetailsDto } from './switch-details.dto';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsString()
  brand!: string;

  @IsString()
  category!: string;

  @IsEnum(PRODUCT_TYPES)
  type!: ProductType;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images!: string[];

  @IsUrl()
  thumbnail!: string;

  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((o: CreateProductDto) => o.type === 'keyboard')
  @IsDefined()
  @ValidateNested()
  @Type(() => KeyboardDetailsDto)
  keyboard?: KeyboardDetailsDto;

  @ValidateIf((o: CreateProductDto) => o.type === 'switch')
  @IsDefined()
  @ValidateNested()
  @Type(() => SwitchDetailsDto)
  switch?: SwitchDetailsDto;

  @ValidateIf((o: CreateProductDto) => o.type === 'keycap')
  @IsDefined()
  @ValidateNested()
  @Type(() => KeycapDetailsDto)
  keycap?: KeycapDetailsDto;

  @ValidateIf((o: CreateProductDto) => o.type === 'accessory')
  @IsDefined()
  @ValidateNested()
  @Type(() => AccessoryDetailsDto)
  accessory?: AccessoryDetailsDto;
}
