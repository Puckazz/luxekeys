import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/index.js';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Delivery address ID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  addressId!: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.COD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Order note',
    example: 'Please deliver during business hours',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
