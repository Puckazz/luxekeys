import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'Product variant ID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'Item quantity',
    type: Number,
    example: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
