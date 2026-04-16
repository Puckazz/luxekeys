import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  KeyboardMountStyle,
  KeyboardSoftware,
} from '../interfaces/product.interface';
import {
  KEYBOARD_MOUNT_STYLES,
  KEYBOARD_SOFTWARES,
} from './product-dto.constants';
import { KeyboardConnectivityDto } from './keyboard-connectivity.dto';
import { KeyboardSwitchDto } from './keyboard-switch.dto';

export class KeyboardDetailsDto {
  @IsString()
  layout!: string;

  @IsInt()
  @Min(1)
  keyCount!: number;

  @ValidateNested()
  @Type(() => KeyboardConnectivityDto)
  connectivity!: KeyboardConnectivityDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  battery?: number;

  @ValidateNested()
  @Type(() => KeyboardSwitchDto)
  switch!: KeyboardSwitchDto;

  @IsBoolean()
  rgb!: boolean;

  @IsOptional()
  @IsEnum(KEYBOARD_SOFTWARES)
  software?: KeyboardSoftware;

  @IsOptional()
  @IsEnum(KEYBOARD_MOUNT_STYLES)
  mountStyle?: KeyboardMountStyle;

  @IsOptional()
  @IsString()
  plateMaterial?: string;

  @IsOptional()
  @IsString()
  caseMaterial?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
