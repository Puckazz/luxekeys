import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockProduct,
  createMockReview,
  uuid,
} from '../../common/testing/index.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a product with auto-generated slug', async () => {
      const product = createMockProduct({
        name: 'Keychron K2',
        slug: 'keychron-k2',
      });
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(product as never);

      const result = await service.create({
        name: 'Keychron K2',
        type: 'KEYBOARD',
        basePrice: 99,
      } as never);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'keychron-k2' }),
        }),
      );
      expect(result.slug).toBe('keychron-k2');
    });

    it('should throw ConflictException when slug already taken', async () => {
      prisma.product.findUnique.mockResolvedValue(createMockProduct() as never);
      await expect(
        service.create({
          name: 'Keychron K2',
          type: 'KEYBOARD',
          basePrice: 99,
        } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated products with price bounds', async () => {
      const products = [createMockProduct(), createMockProduct()];
      prisma.$transaction.mockResolvedValue([
        2,
        products,
        { _max: { basePrice: '199.00' } },
      ] as never);
      prisma.review.groupBy.mockResolvedValue([] as never);

      const result = await service.findAll({} as never);

      expect(result.data.items).toHaveLength(2);
      expect(result.pagination).toMatchObject({ total: 2 });
      expect(result.data.priceBounds).toHaveProperty('max');
    });

    it('should filter by status', async () => {
      prisma.$transaction.mockResolvedValue([
        0,
        [],
        { _max: { basePrice: null } },
      ] as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await service.findAll({ status: 'ACTIVE' } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should apply search by name', async () => {
      prisma.$transaction.mockResolvedValue([
        0,
        [],
        { _max: { basePrice: null } },
      ] as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await service.findAll({ search: 'keychron' } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should filter by price range', async () => {
      prisma.$transaction.mockResolvedValue([
        0,
        [],
        { _max: { basePrice: null } },
      ] as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await service.findAll({ minPrice: 50, maxPrice: 200 } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a product with averageRating', async () => {
      const product = createMockProduct();
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.review.groupBy.mockResolvedValue([
        { productId: product.id, _avg: { rating: 4.5 } },
      ] as never);

      const result = await service.findOne(product.id);
      expect(result).toHaveProperty('averageRating', 4.5);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.findOne(uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findBySlug ─────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const product = createMockProduct({ slug: 'keychron-k2' });
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.review.groupBy.mockResolvedValue([] as never);

      const result = await service.findBySlug('keychron-k2');
      expect(result.slug).toBe('keychron-k2');
    });

    it('should throw NotFoundException when slug not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.findBySlug('missing-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findFeatured ───────────────────────────────────────────────────────────

  describe('findFeatured', () => {
    it('should return featured products with average ratings', async () => {
      const products = [createMockProduct({ isFeatured: true })];
      prisma.product.findMany.mockResolvedValue(products as never);
      prisma.review.groupBy.mockResolvedValue([] as never);

      const result = await service.findFeatured();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('averageRating', 0);
    });
  });

  // ─── findReviews ────────────────────────────────────────────────────────────

  describe('findReviews', () => {
    it('should return paginated reviews for a valid product', async () => {
      const product = createMockProduct();
      const review = createMockReview({ productId: product.id });
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      prisma.$transaction.mockResolvedValue([1, [review]] as never);

      const result = await service.findReviews(product.id);
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await expect(service.findReviews(uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update product fields', async () => {
      const id = uuid();
      const product = createMockProduct({ id });
      const updated = createMockProduct({ id, name: 'Updated' });
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      prisma.productVariant.findFirst.mockResolvedValue(null);
      prisma.product.update.mockResolvedValue(updated as never);

      const result = await service.update(id, { name: 'Updated' } as never);
      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException on slug collision', async () => {
      const id = uuid();
      const product = createMockProduct({ id });
      const conflict = createMockProduct({ id: uuid(), slug: 'taken-slug' });
      prisma.product.findFirst
        .mockResolvedValueOnce(product as never)
        .mockResolvedValueOnce(conflict as never);
      prisma.review.groupBy.mockResolvedValue([] as never);

      await expect(
        service.update(id, { slug: 'taken-slug' } as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await expect(
        service.update(uuid(), { name: 'x' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete product and set status INACTIVE', async () => {
      const id = uuid();
      const product = createMockProduct({ id });
      const deleted = { ...product, deletedAt: new Date(), status: 'INACTIVE' };
      prisma.product.findFirst.mockResolvedValue(product as never);
      prisma.review.groupBy.mockResolvedValue([] as never);
      prisma.product.update.mockResolvedValue(deleted as never);

      const result = await service.remove(id);
      expect(result.deletedAt).not.toBeNull();
      expect(result.status).toBe('INACTIVE');
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.review.groupBy.mockResolvedValue([] as never);
      await expect(service.remove(uuid())).rejects.toThrow(NotFoundException);
    });
  });
});
