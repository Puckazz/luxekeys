import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  Prisma,
  ProductStatus,
  UserRole,
} from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  BulkUpdateOrderStatusDto,
  CreateOrderDto,
  GetOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/index.js';
import {
  AdminOrderDetailResponse,
  AdminOrderListItemResponse,
  AdminOrderSummaryResponse,
  BulkUpdateOrderStatusResponse,
  OrderResponse,
  OrderWithItems,
  ORDER_WITH_ITEMS_INCLUDE,
} from './interfaces/index.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly adminOrderSummarySeed: AdminOrderSummaryResponse = {
    all: 0,
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPING: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  private getCartItemUnitPrice(item: {
    variant: { price: unknown };
    switchOption?: { price: unknown } | null;
  }): number {
    return Number(item.switchOption?.price ?? item.variant.price);
  }

  private resolveVariantThumbnailUrl(item: {
    variant: {
      thumbnailImage?: { imageUrl: string } | null;
      product: {
        thumbnailUrl: string | null;
        images?: Array<{ imageUrl: string; isPrimary: boolean }>;
      };
    };
  }): string | null {
    return (
      item.variant.thumbnailImage?.imageUrl ??
      item.variant.product.thumbnailUrl ??
      item.variant.product.images?.find((image) => image.isPrimary)?.imageUrl ??
      item.variant.product.images?.[0]?.imageUrl ??
      null
    );
  }

  private assertCanAccessOrder(
    orderUserId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): void {
    if (requesterRole !== UserRole.ADMIN && orderUserId !== requesterId) {
      throw new ForbiddenException('You do not have access to this order');
    }
  }

  private getPaymentMethodLabel(method: PaymentMethod): string {
    return method === PaymentMethod.COD ? 'Cash on Delivery' : 'PayPal';
  }

  private getAdminShippingAddressSummary(order: OrderWithItems) {
    return {
      line1: order.shippingStreetAddress ?? order.address?.streetAddress ?? '',
      district: order.shippingProvince ?? order.address?.province ?? '',
      city: order.shippingCity ?? order.address?.city ?? '',
    };
  }

  private getAdminCustomer(order: OrderWithItems) {
    return {
      name: order.shippingFullName ?? order.user.fullName,
      email: order.user.email,
    };
  }

  private mapToAdminListItem(
    order: OrderWithItems,
  ): AdminOrderListItemResponse {
    return {
      id: order.id,
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      status: order.status,
      total: Number(order.totalAmount),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      paymentMethodLabel: this.getPaymentMethodLabel(order.paymentMethod),
      customer: this.getAdminCustomer(order),
      shippingAddress: this.getAdminShippingAddressSummary(order),
    };
  }

  private mapToAdminDetail(order: OrderWithItems): AdminOrderDetailResponse {
    return {
      ...this.mapToAdminListItem(order),
      paymentStatus: order.paymentStatus,
      trackingCode: order.trackingCode,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.productName,
        image: item.thumbnailUrl ?? '',
        variantLabel:
          item.switchOption?.name ??
          item.variantName ??
          item.sku ??
          'Default variant',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }

  private buildAdminSummary(
    orders: OrderWithItems[],
  ): AdminOrderSummaryResponse {
    return orders.reduce<AdminOrderSummaryResponse>(
      (summary, order) => {
        summary.all += 1;
        summary[order.status] += 1;
        return summary;
      },
      { ...this.adminOrderSummarySeed },
    );
  }

  private buildOrderDateWhere(query: GetOrdersQueryDto) {
    if (!query.fromDate && !query.toDate) {
      return undefined;
    }

    return {
      placedAt: {
        ...(query.fromDate && { gte: new Date(query.fromDate) }),
        ...(query.toDate && { lte: new Date(query.toDate) }),
      },
    };
  }

  private buildAdminOrderSearchWhere(search?: string): Prisma.OrderWhereInput {
    if (!search?.trim()) {
      return {};
    }

    const normalizedSearch = search.trim();

    return {
      OR: [
        { orderCode: { contains: normalizedSearch, mode: 'insensitive' } },
        {
          user: {
            fullName: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
        {
          user: {
            email: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
        {
          shippingFullName: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  private sortAdminOrders(
    orders: OrderWithItems[],
    query: GetOrdersQueryDto,
  ): OrderWithItems[] {
    const next = [...orders];
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    if (query.sortBy === 'totalAmount') {
      return next.sort(
        (left, right) =>
          (Number(left.totalAmount) - Number(right.totalAmount)) * sortOrder,
      );
    }

    if (query.sortBy === 'customerName') {
      return next.sort(
        (left, right) =>
          this.getAdminCustomer(left).name.localeCompare(
            this.getAdminCustomer(right).name,
          ) * sortOrder,
      );
    }

    if (query.sortBy === 'status') {
      return next.sort(
        (left, right) => left.status.localeCompare(right.status) * sortOrder,
      );
    }

    return next.sort(
      (left, right) =>
        (left.createdAt.getTime() - right.createdAt.getTime()) * sortOrder,
    );
  }

  private paginateItems<T>(
    items: T[],
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;

    return {
      data: items.slice(start, start + limit),
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    };
  }

  private mapToResponse(order: OrderWithItems): OrderResponse {
    const address = order.shippingFullName
      ? {
          fullName: order.shippingFullName,
          phone: order.shippingPhone || '',
          streetAddress: order.shippingStreetAddress || '',
          province: order.shippingProvince || '',
          city: order.shippingCity || '',
          country: order.shippingCountry || '',
        }
      : order.address;

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
      address,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        switchOptionId: item.switchOptionId ?? null,
        switchOptionName: item.switchOption?.name ?? null,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        thumbnailUrl: item.thumbnailUrl,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        subtotalAmount: Number(item.subtotalAmount),
        isReviewed: !!item.review,
        review: item.review
          ? {
              id: item.review.id,
              rating: item.review.rating,
              status: item.review.status,
              title: item.review.title,
              content: item.review.content,
            }
          : null,
      })),
    };
  }

  private generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LK-${timestamp}-${random}`;
  }

  async findOne(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: ORDER_WITH_ITEMS_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    this.assertCanAccessOrder(order.userId, requesterId, requesterRole);

    return this.mapToResponse(order);
  }

  async findOneAdmin(id: string): Promise<AdminOrderDetailResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: ORDER_WITH_ITEMS_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return this.mapToAdminDetail(order);
  }

  async findByCode(
    orderCode: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { orderCode },
      include: ORDER_WITH_ITEMS_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order with code "${orderCode}" not found`);
    }

    this.assertCanAccessOrder(order.userId, requesterId, requesterRole);

    return this.mapToResponse(order);
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
      ...this.buildOrderDateWhere(query),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: ORDER_WITH_ITEMS_INCLUDE,
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: orders.map((order) => this.mapToResponse(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(query: GetOrdersQueryDto): Promise<{
    data: {
      items: AdminOrderListItemResponse[];
      summary: AdminOrderSummaryResponse;
    };
    pagination: PaginatedResponse<AdminOrderListItemResponse>['pagination'];
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sharedWhere: Prisma.OrderWhereInput = {
      ...this.buildAdminOrderSearchWhere(query.search),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.userId && { userId: query.userId }),
      ...this.buildOrderDateWhere(query),
    };
    const filteredWhere: Prisma.OrderWhereInput = {
      ...sharedWhere,
      ...(query.status && { status: query.status }),
    };

    const [summaryOrders, filteredOrders] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: sharedWhere,
        include: ORDER_WITH_ITEMS_INCLUDE,
      }),
      this.prisma.order.findMany({
        where: filteredWhere,
        include: ORDER_WITH_ITEMS_INCLUDE,
      }),
    ]);

    const paginated = this.paginateItems(
      this.sortAdminOrders(filteredOrders, query),
      page,
      limit,
    );

    return {
      data: {
        items: paginated.data.map((order) => this.mapToAdminListItem(order)),
        summary: this.buildAdminSummary(summaryOrders),
      },
      pagination: paginated.pagination,
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

    const order = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: {
                        where: { isPrimary: true },
                        select: { imageUrl: true, isPrimary: true },
                        take: 1,
                      },
                    },
                  },
                  thumbnailImage: {
                    select: { imageUrl: true },
                  },
                },
              },
              switchOption: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      for (const item of cart.items) {
        if (
          item.variant.product.status !== ProductStatus.ACTIVE ||
          item.variant.product.deletedAt
        ) {
          throw new BadRequestException(
            `Product "${item.variant.product.name}" is no longer available`,
          );
        }

        if (!item.variant.isActive) {
          throw new BadRequestException(
            `Variant "${item.variant.name}" is no longer available`,
          );
        }

        if (item.switchOptionId) {
          if (!item.switchOption) {
            throw new BadRequestException(
              `Switch option for "${item.variant.name}" is not available`,
            );
          }

          if (!item.switchOption.isActive || item.switchOption.deletedAt) {
            throw new BadRequestException(
              `Switch option "${item.switchOption.name}" for "${item.variant.name}" is no longer available`,
            );
          }
        }

        const variantUpdate = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            deletedAt: null,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (variantUpdate.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for "${item.variant.name}"`,
          );
        }

        if (item.switchOptionId) {
          const switchUpdate = await tx.productSwitchOption.updateMany({
            where: {
              id: item.switchOptionId,
              variantId: item.variantId,
              isActive: true,
              deletedAt: null,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (switchUpdate.count === 0) {
            throw new BadRequestException(
              `Insufficient switch option stock for "${item.variant.name}"`,
            );
          }
        }
      }

      const subtotalAmount = cart.items.reduce((sum, item) => {
        return sum + this.getCartItemUnitPrice(item) * item.quantity;
      }, 0);

      const discountAmount = 0;
      const shippingAmount = 0;
      const totalAmount = subtotalAmount - discountAmount + shippingAmount;

      const newOrder = await tx.order.create({
        data: {
          orderCode: this.generateOrderCode(),
          userId,
          addressId: address.id,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingStreetAddress: address.streetAddress,
          shippingProvince: address.province,
          shippingCity: address.city,
          shippingCountry: address.country,
          paymentMethod: dto.paymentMethod,
          note: dto.note,
          subtotalAmount,
          discountAmount,
          shippingAmount,
          totalAmount,
          items: {
            create: cart.items.map((item) => {
              const unitPrice = this.getCartItemUnitPrice(item);

              return {
                productId: item.variant.productId,
                variantId: item.variantId,
                switchOptionId: item.switchOptionId ?? null,
                productName: item.variant.product.name,
                variantName: item.variant.name,
                sku: item.variant.sku,
                thumbnailUrl: this.resolveVariantThumbnailUrl(item),
                unitPrice,
                quantity: item.quantity,
                subtotalAmount: unitPrice * item.quantity,
              };
            }),
          },
        },
        include: ORDER_WITH_ITEMS_INCLUDE,
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return this.mapToResponse(order);
  }

  async cancelOrder(id: string, userId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: ORDER_WITH_ITEMS_INCLUDE,
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
        include: ORDER_WITH_ITEMS_INCLUDE,
      });

      await Promise.all(
        order.items.flatMap((item) => {
          const updates: Prisma.PrismaPromise<unknown>[] = [
            tx.productVariant.update({
              where: { id: item.variantId ?? undefined },
              data: { stock: { increment: item.quantity } },
            }),
          ];

          if (item.switchOptionId) {
            updates.push(
              tx.productSwitchOption.update({
                where: { id: item.switchOptionId },
                data: { stock: { increment: item.quantity } },
              }),
            );
          }

          return updates;
        }),
      );

      return cancelled;
    });

    return this.mapToResponse(updated);
  }

  async updateOrder(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderDetailResponse> {
    if (
      dto.status === undefined &&
      dto.paymentStatus === undefined &&
      dto.paymentMethod === undefined &&
      dto.trackingCode === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

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
        ...(dto.trackingCode !== undefined && {
          trackingCode: dto.trackingCode?.trim()
            ? dto.trackingCode.trim()
            : null,
        }),
      },
      include: ORDER_WITH_ITEMS_INCLUDE,
    });

    return this.mapToAdminDetail(updated);
  }

  async bulkUpdateStatus(
    dto: BulkUpdateOrderStatusDto,
  ): Promise<BulkUpdateOrderStatusResponse> {
    const foundOrders = await this.prisma.order.findMany({
      where: {
        id: {
          in: dto.orderIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundOrders.length !== dto.orderIds.length) {
      throw new NotFoundException('One or more orders were not found');
    }

    const updatedCount = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: {
          id: {
            in: dto.orderIds,
          },
        },
        data: {
          status: dto.status,
        },
      });

      return result.count;
    });

    return {
      updatedCount,
    };
  }
}
