import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type {
  KeycapLegend,
  KeycapMaterial,
} from '../interfaces/product.interface';
import { KEYCAP_LEGENDS, KEYCAP_MATERIALS } from './product-dto.constants';

export class KeycapDetailsDto {
  @IsEnum(KEYCAP_MATERIALS)
  material!: KeycapMaterial;

  @IsString()
  profile!: string;

  @IsEnum(KEYCAP_LEGENDS)
  legend!: KeycapLegend;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  compatibility!: string[];

  @IsInt()
  @Min(1)
  keyCount!: number;

  @IsOptional()
  @IsString()
  thickness?: string;
}
