import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
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
}
