import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductType } from '../../generated/prisma/index.js';
import {
  createMockBrand,
  createMockPrismaService,
  MockPrismaService,
} from '../../common/testing/index.js';
import { PrismaService } from '../database/prisma.service.js';
import { ProductUpsertService } from './product-upsert.service.js';

describe('ProductUpsertService', () => {
  let service: ProductUpsertService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductUpsertService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductUpsertService>(ProductUpsertService);
  });

  describe('syncAdminProductVariants', () => {
    it('should auto-generate SKU when missing', async () => {
      prisma.brand.findFirst.mockResolvedValue(
        createMockBrand({ slug: 'keychron' }) as never,
      );
      prisma.productVariant.findMany.mockResolvedValue([] as never);
      prisma.productVariant.findFirst.mockResolvedValue(null as never);
      prisma.productVariant.create.mockResolvedValue({ id: 'variant-1' } as never);
      prisma.product.update.mockResolvedValue({ id: 'product-1' } as never);

      await service.syncAdminProductVariants(
        prisma as never,
        'product-1',
        {
          name: 'Q1 Max',
          type: ProductType.ACCESSORY,
          brandId: 'brand-1',
          variants: [
            {
              color: 'Black',
              switchType: 'Desk Mat',
              sku: '',
              price: 39.99,
              stock: 5,
              isDefault: true,
              isActive: true,
              switchOptions: [],
            },
          ],
        } as never,
      );

      expect(prisma.productVariant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sku: 'KQ1M-BLK-DM',
          }),
        }),
      );
    });

    it('should normalize manual SKU values before saving', async () => {
      prisma.productVariant.findMany.mockResolvedValue([] as never);
      prisma.productVariant.findFirst.mockResolvedValue(null as never);
      prisma.productVariant.create.mockResolvedValue({ id: 'variant-1' } as never);
      prisma.product.update.mockResolvedValue({ id: 'product-1' } as never);

      await service.syncAdminProductVariants(
        prisma as never,
        'product-1',
        {
          name: 'Desk Pad',
          type: ProductType.ACCESSORY,
          variants: [
            {
              color: 'Gray',
              switchType: 'Large',
              sku: ' custom sku / 01 ',
              price: 29.99,
              stock: 8,
              isDefault: true,
              isActive: true,
              switchOptions: [],
            },
          ],
        } as never,
      );

      expect(prisma.productVariant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sku: 'CUSTOM-SKU-01',
          }),
        }),
      );
    });

    it('should throw when generated or normalized SKU conflicts', async () => {
      prisma.productVariant.findMany.mockResolvedValue([] as never);
      prisma.productVariant.findFirst.mockResolvedValue({ id: 'taken' } as never);

      await expect(
        service.syncAdminProductVariants(
          prisma as never,
          'product-1',
          {
            name: 'Desk Pad',
            type: ProductType.ACCESSORY,
            variants: [
              {
                color: 'Gray',
                switchType: 'Large',
                sku: 'taken-sku',
                price: 29.99,
                stock: 8,
                isDefault: true,
                isActive: true,
                switchOptions: [],
              },
            ],
          } as never,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw when SKU cannot be generated', async () => {
      prisma.productVariant.findMany.mockResolvedValue([] as never);

      await expect(
        service.syncAdminProductVariants(
          prisma as never,
          'product-1',
          {
            name: '   ',
            type: ProductType.ACCESSORY,
            variants: [
              {
                color: 'Gray',
                switchType: 'Large',
                sku: '',
                price: 29.99,
                stock: 8,
                isDefault: true,
                isActive: true,
                switchOptions: [],
              },
            ],
          } as never,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
