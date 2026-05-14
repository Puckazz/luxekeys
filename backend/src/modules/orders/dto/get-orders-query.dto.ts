import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/index.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export const ADMIN_ORDER_SORT_FIELDS = [
  'createdAt',
  'totalAmount',
  'customerName',
  'status',
] as const;

export type AdminOrderSortField = (typeof ADMIN_ORDER_SORT_FIELDS)[number];

export class GetOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by order code, customer name, email, or shipping name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment method',
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Filter by user ID (admin only)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter orders placed from this date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter orders placed up to this date (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: ADMIN_ORDER_SORT_FIELDS })
  @IsOptional()
  @IsIn(ADMIN_ORDER_SORT_FIELDS)
  sortBy?: AdminOrderSortField;
}
