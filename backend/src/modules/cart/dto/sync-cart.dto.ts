import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class SyncCartItemDto {
  @ApiProperty({
    description: 'Product variant ID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'Product switch option ID (optional)',
    type: String,
    format: 'uuid',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  switchOptionId?: string;

  @ApiProperty({
    description: 'Item quantity',
    type: Number,
    example: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class SyncCartDto {
  @ApiProperty({
    description: 'Array of items to sync',
    type: [SyncCartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items!: SyncCartItemDto[];
}
