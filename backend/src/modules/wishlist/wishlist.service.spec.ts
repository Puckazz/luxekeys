import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockProduct,
  createMockWishlistItem,
  uuid,
} from '../../common/testing/index.js';

describe('WishlistService', () => {
  let service: WishlistService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<WishlistService>(WishlistService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all wishlist items for a user', async () => {
      const userId = uuid();
      const items = [
        createMockWishlistItem({ userId }),
        createMockWishlistItem({ userId }),
      ];
      prisma.wishlistItem.findMany.mockResolvedValue(items as never);

      const result = await service.findAll(userId);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no wishlist items', async () => {
      prisma.wishlistItem.findMany.mockResolvedValue([]);
      const result = await service.findAll(uuid());
      expect(result).toHaveLength(0);
    });
  });

  // ─── add ────────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('should add a product to the wishlist', async () => {
      const userId = uuid();
      const product = createMockProduct();
      const wishlistItem = createMockWishlistItem({
        userId,
        productId: product.id,
      });

      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.wishlistItem.findUnique.mockResolvedValue(null);
      prisma.wishlistItem.create.mockResolvedValue(wishlistItem as never);

      const result = await service.add(userId, { productId: product.id });
      expect(result.productId).toBe(product.id);
    });

    it('should return existing wishlist item without creating a duplicate', async () => {
      const userId = uuid();
      const product = createMockProduct();
      const existing = createMockWishlistItem({
        userId,
        productId: product.id,
      });

      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.wishlistItem.findUnique.mockResolvedValue(existing as never);

      const result = await service.add(userId, { productId: product.id });
      expect(prisma.wishlistItem.create).not.toHaveBeenCalled();
      expect(result.id).toBe(existing.id);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.add(uuid(), { productId: uuid() })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove a product from the wishlist', async () => {
      const userId = uuid();
      const productId = uuid();
      const item = createMockWishlistItem({ userId, productId });

      prisma.wishlistItem.findUnique.mockResolvedValue(item as never);
      prisma.wishlistItem.delete.mockResolvedValue(item as never);

      const result = await service.remove(userId, productId);
      expect(result).toEqual({ removed: true });
      expect(prisma.wishlistItem.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product is not in wishlist', async () => {
      prisma.wishlistItem.findUnique.mockResolvedValue(null);
      await expect(service.remove(uuid(), uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
