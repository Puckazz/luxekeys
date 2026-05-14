import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/index.js';

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'New payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment method override (admin only)',
    enum: PaymentMethod,
    example: PaymentMethod.COD,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Tracking code override (admin only)',
    example: 'VNPOST-123456789',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  trackingCode?: string | null;
}

export class BulkUpdateOrderStatusDto {
  @ApiProperty({
    type: [String],
    description: 'Order IDs to update',
    example: [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  orderIds!: string[];

  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
