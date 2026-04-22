import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductSpecDto {
  @ApiProperty({ example: 'Mounting Style' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  specKey!: string;

  @ApiProperty({ example: 'Gasket Mount' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  specValue!: string;

  @ApiPropertyOptional({ example: 'Structure' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  groupName?: string;

  @ApiPropertyOptional({ example: 1, default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
