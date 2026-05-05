import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ example: '6f88b20d-7d38-4f23-a63c-8bbf9c0aa111' })
  @IsUUID()
  productId!: string;
}
