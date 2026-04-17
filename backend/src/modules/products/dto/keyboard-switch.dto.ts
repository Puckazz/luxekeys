import { IsBoolean, IsEnum, IsString } from 'class-validator';
import type { ProductSwitchKind } from '../interfaces/product.interface';
import { PRODUCT_SWITCH_KINDS } from './product-dto.constants';

export class KeyboardSwitchDto {
  @IsString()
  brand!: string;

  @IsEnum(PRODUCT_SWITCH_KINDS)
  type!: ProductSwitchKind;

  @IsBoolean()
  hotSwappable!: boolean;
}
