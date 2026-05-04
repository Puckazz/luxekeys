import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, OrderStatus } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service.js';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface.js';
import {
  CreateOrderDto,
  GetOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/index.js';
import { OrderResponse, OrderWithItems } from './interfaces/index.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(order: OrderWithItems): OrderResponse {
    return {
      id: order.id,
      orderCode: order.orderCode,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotalAmount: Number(order.subtotalAmount),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      totalAmount: Number(order.totalAmount),
      note: order.note,
      trackingCode: order.trackingCode,
      placedAt: order.placedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      address: order.address,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        thumbnailUrl: item.thumbnailUrl,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        subtotalAmount: Number(item.subtotalAmount),
      })),
    };
  }

  private generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LK-${timestamp}-${random}`;
  }

  private buildOrderInclude() {
    return {
      items: true,
      address: {
        select: {
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          ward: true,
          district: true,
          city: true,
          country: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  async findOne(id: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: this.buildOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return this.mapToResponse(order as OrderWithItems);
  }

  async findByCode(orderCode: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { orderCode },
      include: this.buildOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException(`Order with code "${orderCode}" not found`);
    }

    return this.mapToResponse(order as OrderWithItems);
  }

  async findMyOrders(
    userId: string,
    query: GetOrdersQueryDto,
  ): Promise<PaginatedResponse<OrderResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.fromDate || query.toDate
        ? {
            placedAt: {
              ...(query.fromDate && { gte: new Date(query.fromDate) }),
              ...(query.toDate && { lte: new Date(query.toDate) }),
            },
          }
        : {}),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: this.buildOrderInclude(),
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: (orders as OrderWithItems[]).map((o) => this.mapToResponse(o)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(
    query: GetOrdersQueryDto,
  ): Promise<PaginatedResponse<OrderResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.userId && { userId: query.userId }),
      ...(query.fromDate || query.toDate
        ? {
            placedAt: {
              ...(query.fromDate && { gte: new Date(query.fromDate) }),
              ...(query.toDate && { lte: new Date(query.toDate) }),
            },
          }
        : {}),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: this.buildOrderInclude(),
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: (orders as OrderWithItems[]).map((o) => this.mapToResponse(o)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponse> {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID "${dto.addressId}" not found`,
      );
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cart.items) {
      if (!item.variant.isActive) {
        throw new BadRequestException(
          `Variant "${item.variant.name}" is no longer available`,
        );
      }
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.variant.name}". Available: ${item.variant.stock}`,
        );
      }
    }

    const subtotalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderCode: this.generateOrderCode(),
          userId,
          addressId: address.id,
          paymentMethod: dto.paymentMethod,
          note: dto.note,
          subtotalAmount,
          totalAmount: subtotalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.productId,
              variantId: item.variantId,
              productName: item.variant.product.name,
              variantName: item.variant.name,
              sku: item.variant.sku,
              thumbnailUrl: item.variant.product.thumbnailUrl,
              unitPrice: item.variant.price,
              quantity: item.quantity,
              subtotalAmount: Number(item.variant.price) * item.quantity,
            })),
          },
        },
        include: this.buildOrderInclude(),
      });

      await Promise.all(
        cart.items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return this.mapToResponse(order as OrderWithItems);
  }

  async cancelOrder(id: string, userId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: this.buildOrderInclude(),
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot cancel an order with status "${order.status}"`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: this.buildOrderInclude(),
      });

      await Promise.all(
        order.items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId ?? undefined },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );

      return cancelled;
    });

    return this.mapToResponse(updated as OrderWithItems);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.paymentStatus && { paymentStatus: dto.paymentStatus }),
        ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
      },
      include: this.buildOrderInclude(),
    });

    return this.mapToResponse(updated as OrderWithItems);
  }
}
