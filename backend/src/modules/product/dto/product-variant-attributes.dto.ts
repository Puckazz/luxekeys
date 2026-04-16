import { IsOptional, IsString } from 'class-validator';

export class ProductVariantAttributesDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  switchType?: string;

  @IsOptional()
  @IsString()
  layout?: string;
}
