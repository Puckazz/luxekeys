import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AddCartItemDto, SyncCartDto, UpdateCartItemDto } from './dto/index.js';
import { CartItemResponse, CartResponse } from './interfaces/index.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponse> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
            switchOption: true,
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      thumbnailUrl: true,
                    },
                  },
                },
              },
              switchOption: true,
            },
          },
        },
      });
    }

    let subtotal = 0;
    const items: CartItemResponse[] = cart.items.map((item) => {
      const price = Number(item.variant.price);
      subtotal += price * item.quantity;
      return {
        id: item.id,
        variantId: item.variantId,
        switchOptionId: item.switchOptionId,
        quantity: item.quantity,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          sku: item.variant.sku,
          price,
          product: item.variant.product,
        },
        switchOption: item.switchOption
          ? {
              id: item.switchOption.id,
              name: item.switchOption.name,
              switchType: item.switchOption.switchType,
            }
          : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async syncCart(userId: string, dto: SyncCartDto): Promise<CartResponse> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Delete existing cart items to ensure we are fully in sync with the frontend ground truth
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    for (const itemDto of dto.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: itemDto.variantId },
      });

      if (!variant || !variant.isActive) {
        continue;
      }

      // Use switch option stock when available, otherwise fall back to variant stock
      let availableStock = variant.stock;
      if (itemDto.switchOptionId) {
        const switchOption = await this.prisma.productSwitchOption.findUnique({
          where: { id: itemDto.switchOptionId },
        });
        if (!switchOption) continue;
        availableStock = switchOption.stock;
      }

      const finalQuantity = Math.min(itemDto.quantity, availableStock);
      if (finalQuantity > 0) {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: itemDto.variantId,
            switchOptionId: itemDto.switchOptionId ?? null,
            quantity: finalQuantity,
          },
        });
      }
    }

    return this.getCart(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (!variant.isActive) {
      throw new BadRequestException('Product variant is not available');
    }

    // Use switch option stock when available, otherwise fall back to variant stock
    let availableStock = variant.stock;
    if (dto.switchOptionId) {
      const switchOption = await this.prisma.productSwitchOption.findUnique({
        where: { id: dto.switchOptionId },
      });
      if (!switchOption) {
        throw new NotFoundException('Switch option not found');
      }
      availableStock = switchOption.stock;
    }

    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}`,
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
        switchOptionId: dto.switchOptionId ?? null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity > availableStock) {
        throw new BadRequestException(
          `Cannot add. Total quantity ${newQuantity} exceeds stock ${availableStock}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          switchOptionId: dto.switchOptionId ?? null,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        variant: true,
        switchOption: true,
      },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Item not found in cart');
    }

    if (!cartItem.variant.isActive) {
      throw new BadRequestException('Product variant is not available');
    }

    const availableStock = cartItem.switchOption
      ? cartItem.switchOption.stock
      : cartItem.variant.stock;

    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<{ cleared: boolean }> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { cleared: true };
  }
}
