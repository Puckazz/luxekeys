import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/index.js';
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
                    thumbnailUrl: true,
                  },
                },
              },
            },
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
                      thumbnailUrl: true,
                    },
                  },
                },
              },
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
        quantity: item.quantity,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          sku: item.variant.sku,
          price,
          product: item.variant.product,
        },
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

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    // Verify variant exists and is active
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

    if (variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${variant.stock}`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
        switchOptionId: null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity > variant.stock) {
        throw new BadRequestException(
          `Cannot add. Total quantity ${newQuantity} exceeds stock ${variant.stock}`,
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
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    variantId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    // Verify variant exists and is active
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (!variant.isActive) {
      throw new BadRequestException('Product variant is not available');
    }

    if (variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${variant.stock}`,
      );
    }

    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Update cart item
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
        switchOptionId: null,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, variantId: string): Promise<CartResponse> {
    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find and delete cart item
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
        switchOptionId: null,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

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
