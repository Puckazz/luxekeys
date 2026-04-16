import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { ProductSwitchKind } from '../interfaces/product.interface';
import { PRODUCT_SWITCH_KINDS, SWITCH_PINS } from './product-dto.constants';

export class SwitchDetailsDto {
  @IsString()
  brand!: string;

  @IsEnum(PRODUCT_SWITCH_KINDS)
  type!: ProductSwitchKind;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actuationForce?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bottomOutForce?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  travelDistance?: number;

  @IsOptional()
  @IsBoolean()
  factoryLubed?: boolean;

  @IsOptional()
  @IsString()
  material?: string;

  @IsEnum(SWITCH_PINS)
  pins!: 3 | 5;

  @IsInt()
  @Min(1)
  quantity!: number;
}
