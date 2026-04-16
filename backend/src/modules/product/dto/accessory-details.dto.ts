import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import type { AccessoryKind } from '../interfaces/product.interface';
import { ACCESSORY_KINDS } from './product-dto.constants';

export class AccessoryDetailsDto {
  @IsEnum(ACCESSORY_KINDS)
  kind!: AccessoryKind;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  compatibility?: string[];
}
