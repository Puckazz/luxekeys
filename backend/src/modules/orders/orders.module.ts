import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import {
  OrdersController,
  AdminOrdersController,
} from './orders.controller.js';

@Module({
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
