import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockProduct,
  createMockReview,
  createMockUser,
  uuid,
} from '../../common/testing/index.js';
import { UserRole } from '../../generated/prisma/index.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<ReviewsService>(ReviewsService);
  });

  // ─── findAllByProduct ────────────────────────────────────────────────────────

  describe('findAllByProduct', () => {
    it('should return paginated reviews for a valid product', async () => {
      const product = createMockProduct();
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.$transaction.mockResolvedValue([
        1,
        [createMockReview({ productId: product.id })],
      ] as never);

      const result = await service.findAllByProduct(product.id, {} as never);
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(
        service.findAllByProduct(uuid(), {} as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a review when user has purchased the product', async () => {
      const product = createMockProduct();
      const user = createMockUser();
      const review = createMockReview({
        productId: product.id,
        userId: user.id,
      });

      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.orderItem.findFirst.mockResolvedValue({ id: uuid() } as never);
      prisma.review.findFirst.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(review as never);

      const result = await service.create(product.id, user.id, {
        rating: 5,
        title: 'Great!',
      } as never);

      expect(result.rating).toBe(5);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(
        service.create(uuid(), uuid(), { rating: 5 } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user has not purchased the product', async () => {
      prisma.product.findFirst.mockResolvedValue(createMockProduct() as never);
      prisma.orderItem.findFirst.mockResolvedValue(null);

      await expect(
        service.create(uuid(), uuid(), { rating: 5 } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user has already reviewed', async () => {
      prisma.product.findFirst.mockResolvedValue(createMockProduct() as never);
      prisma.orderItem.findFirst.mockResolvedValue({ id: uuid() } as never);
      prisma.review.findFirst.mockResolvedValue(createMockReview() as never);

      await expect(
        service.create(uuid(), uuid(), { rating: 4 } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update review when owner requests it', async () => {
      const userId = uuid();
      const review = createMockReview({ userId });
      const updated = { ...review, rating: 3 };

      prisma.review.findFirst.mockResolvedValue(review as never);
      prisma.review.update.mockResolvedValue(updated as never);

      const result = await service.update(
        review.productId as string,
        review.id,
        userId,
        { rating: 3 } as never,
      );
      expect(result.rating).toBe(3);
    });

    it('should throw NotFoundException when review not found', async () => {
      prisma.review.findFirst.mockResolvedValue(null);
      await expect(
        service.update(uuid(), uuid(), uuid(), { rating: 3 } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-owner tries to update', async () => {
      const review = createMockReview({ userId: uuid() });
      prisma.review.findFirst.mockResolvedValue(review as never);

      await expect(
        service.update(review.productId as string, review.id, uuid(), {
          rating: 1,
        } as never),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should allow owner to soft-delete their review', async () => {
      const userId = uuid();
      const review = createMockReview({ userId });
      const deleted = { ...review, deletedAt: new Date() };

      prisma.review.findFirst.mockResolvedValue(review as never);
      prisma.review.update.mockResolvedValue(deleted as never);

      const result = await service.remove(
        review.productId as string,
        review.id,
        userId,
        UserRole.CUSTOMER,
      );
      expect(result.deletedAt).not.toBeNull();
    });

    it('should allow admin to delete any review', async () => {
      const review = createMockReview({ userId: uuid() });
      const deleted = { ...review, deletedAt: new Date() };

      prisma.review.findFirst.mockResolvedValue(review as never);
      prisma.review.update.mockResolvedValue(deleted as never);

      const result = await service.remove(
        review.productId as string,
        review.id,
        uuid(),
        UserRole.ADMIN,
      );
      expect(result.deletedAt).not.toBeNull();
    });

    it('should throw ForbiddenException when non-owner, non-admin tries to delete', async () => {
      const review = createMockReview({ userId: uuid() });
      prisma.review.findFirst.mockResolvedValue(review as never);

      await expect(
        service.remove(
          review.productId as string,
          review.id,
          uuid(),
          UserRole.CUSTOMER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
