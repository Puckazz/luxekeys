import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service.js';
import { ProductsService } from './products.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockProduct,
  createMockVariant,
  uuid,
} from '../../common/testing/index.js';

describe('ProductVariantsService', () => {
  let service: ProductVariantsService;
  let prisma: MockPrismaService;
  let productsService: jest.Mocked<Pick<ProductsService, 'findOne'>>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    productsService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get<ProductVariantsService>(ProductVariantsService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return active variants for a valid product', async () => {
      const productId = uuid();
      const variant = createMockVariant({ productId });
      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findMany.mockResolvedValue([variant] as never);

      const result = await service.findAll(productId);
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      productsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.findAll(uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create the first variant and mark it as default', async () => {
      const productId = uuid();
      const variant = createMockVariant({ productId, isDefault: true });
      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findFirst.mockResolvedValue(null);

      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          prisma.productVariant.count.mockResolvedValue(0 as never);
          prisma.productVariant.create.mockResolvedValue(variant as never);
          prisma.productVariant.findFirst.mockResolvedValue(variant as never);
          prisma.productVariant.updateMany.mockResolvedValue({
            count: 0,
          } as never);
          prisma.product.update.mockResolvedValue(
            createMockProduct({ id: productId }) as never,
          );
          return fn(prisma as never);
        },
      );

      const result = await service.create(productId, {
        sku: 'K2-001',
        name: 'Black',
        price: 99,
        stock: 10,
      } as never);

      expect(result.isDefault).toBe(true);
    });

    it('should throw ConflictException when SKU is already taken', async () => {
      const productId = uuid();
      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findFirst.mockResolvedValue(
        createMockVariant() as never,
      );

      await expect(
        service.create(productId, {
          sku: 'EXISTING-SKU',
          name: 'x',
          price: 1,
        } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update variant fields', async () => {
      const productId = uuid();
      const id = uuid();
      const variant = createMockVariant({ id, productId });
      const updated = createMockVariant({ id, productId, name: 'White' });

      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findFirst.mockResolvedValue(variant as never);
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          prisma.productVariant.update.mockResolvedValue(updated as never);
          prisma.productVariant.findFirst.mockResolvedValue(updated as never);
          prisma.productVariant.updateMany.mockResolvedValue({
            count: 0,
          } as never);
          prisma.product.update.mockResolvedValue(
            createMockProduct({ id: productId }) as never,
          );
          return fn(prisma as never);
        },
      );

      const result = await service.update(productId, id, {
        name: 'White',
      } as never);
      expect(result.name).toBe('White');
    });

    it('should throw ConflictException when updating to a duplicate SKU', async () => {
      const productId = uuid();
      const id = uuid();
      const variant = createMockVariant({ id, productId, sku: 'ORIG-SKU' });
      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findFirst
        .mockResolvedValueOnce(variant as never)
        .mockResolvedValueOnce(
          createMockVariant({ sku: 'TAKEN-SKU' }) as never,
        );

      await expect(
        service.update(productId, id, { sku: 'TAKEN-SKU' } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete the variant and promote the next default', async () => {
      const productId = uuid();
      const id = uuid();
      const variant = createMockVariant({ id, productId });
      const nextVariant = createMockVariant({ productId, isDefault: false });

      productsService.findOne.mockResolvedValue(
        createMockProduct({ id: productId }) as never,
      );
      prisma.productVariant.findFirst.mockResolvedValue(variant as never);
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          const removed = {
            ...variant,
            deletedAt: new Date(),
            isActive: false,
            isDefault: false,
          };
          prisma.productVariant.update
            .mockResolvedValueOnce(removed as never)
            .mockResolvedValueOnce({
              ...nextVariant,
              isDefault: true,
            } as never);
          prisma.productVariant.findFirst.mockResolvedValue(
            nextVariant as never,
          );
          prisma.productVariant.updateMany.mockResolvedValue({
            count: 0,
          } as never);
          prisma.product.update.mockResolvedValue(
            createMockProduct({ id: productId }) as never,
          );
          return fn(prisma as never);
        },
      );

      const result = await service.remove(productId, id);
      expect(result.deletedAt).not.toBeNull();
    });
  });
});
