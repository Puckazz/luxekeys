import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto.js';
import {
  WISHLIST_ITEM_INCLUDE,
  WishlistItemDetail,
} from './interfaces/wishlist.interface.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<WishlistItemDetail[]> {
    return this.prisma.wishlistItem.findMany({
      where: {
        userId,
        product: { deletedAt: null, status: 'ACTIVE' },
      },
      orderBy: { createdAt: 'desc' },
      include: WISHLIST_ITEM_INCLUDE,
    });
  }

  async add(
    userId: string,
    dto: AddToWishlistDto,
  ): Promise<WishlistItemDetail> {
    await this.assertProductExists(dto.productId);

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      include: WISHLIST_ITEM_INCLUDE,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.wishlistItem.create({
      data: {
        userId,
        productId: dto.productId,
      },
      include: WISHLIST_ITEM_INCLUDE,
    });
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<{ removed: boolean }> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return { removed: true };
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }
  }
}
