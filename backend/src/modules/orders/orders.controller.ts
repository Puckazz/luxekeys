import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { Roles } from '../../common/decorators/index.js';
import { UserRole } from '../../generated/prisma/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import {
  CreateOrderDto,
  GetOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/index.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user orders (paginated)' })
  @ApiOkResponse({ description: 'Paginated list of user orders', type: Object })
  findMyOrders(
    @CurrentUser() user: AuthUser,
    @Query() query: GetOrdersQueryDto,
  ) {
    return this.ordersService.findMyOrders(user.id, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiOkResponse({ description: 'Created order', type: Object })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get('code/:orderCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail by order code' })
  @ApiParam({ name: 'orderCode', type: String, description: 'Order code' })
  @ApiOkResponse({ description: 'Order detail', type: Object })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findByCode(
    @CurrentUser() user: AuthUser,
    @Param('orderCode') orderCode: string,
  ) {
    return this.ordersService.findByCode(orderCode, user.id, user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Order detail', type: Object })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order (owner only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Cancelled order', type: Object })
  @ApiNotFoundResponse({ description: 'Order not found' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.cancelOrder(id, user.id);
  }
}

@ApiTags('Admin — Orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders (admin, paginated, filterable)' })
  @ApiOkResponse({ description: 'Paginated list of all orders', type: Object })
  findAll(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status or payment status (admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Updated order', type: Object })
  @ApiNotFoundResponse({ description: 'Order not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
