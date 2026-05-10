import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brands.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockBrand,
  createMockProduct,
  uuid,
} from '../../common/testing/index.js';

describe('BrandsService', () => {
  let service: BrandsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<BrandsService>(BrandsService);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a brand with auto-generated slug', async () => {
      const brand = createMockBrand({ name: 'Keychron', slug: 'keychron' });
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue(brand as never);

      const result = await service.create({ name: 'Keychron' } as never);

      expect(prisma.brand.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'keychron' }),
        }),
      );
      expect(result.slug).toBe('keychron');
    });

    it('should throw ConflictException when slug is already taken', async () => {
      prisma.brand.findUnique.mockResolvedValue(createMockBrand() as never);
      await expect(
        service.create({ name: 'Keychron' } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated brands', async () => {
      const brands = [createMockBrand(), createMockBrand()];
      prisma.$transaction.mockResolvedValue([2, brands] as never);

      const result = await service.findAll({} as never);

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toMatchObject({ page: 1, limit: 10, total: 2 });
    });

    it('should apply search filter', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);
      await service.findAll({ search: 'key' } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should filter by isActive', async () => {
      const inactive = createMockBrand({ isActive: false });
      prisma.$transaction.mockResolvedValue([1, [inactive]] as never);

      const result = await service.findAll({ isActive: false } as never);
      expect(result.data[0].isActive).toBe(false);
    });

    it('should apply custom sort', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);
      await service.findAll({ sortBy: 'name', sortOrder: 'asc' } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a brand when found', async () => {
      const id = uuid();
      const brand = createMockBrand({ id });
      prisma.brand.findFirst.mockResolvedValue(brand as never);

      const result = await service.findOne(id);
      expect(result.id).toBe(id);
    });

    it('should throw NotFoundException when brand not found', async () => {
      prisma.brand.findFirst.mockResolvedValue(null);
      await expect(service.findOne(uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findProductsByBrand ────────────────────────────────────────────────────

  describe('findProductsByBrand', () => {
    it('should return paginated products for a valid brand', async () => {
      const brand = createMockBrand();
      prisma.brand.findFirst.mockResolvedValue(brand as never);
      prisma.$transaction.mockResolvedValue([
        1,
        [createMockProduct()],
      ] as never);

      const result = await service.findProductsByBrand(brand.id);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });

    it('should throw NotFoundException when brand does not exist', async () => {
      prisma.brand.findFirst.mockResolvedValue(null);
      await expect(service.findProductsByBrand(uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update brand fields', async () => {
      const id = uuid();
      const brand = createMockBrand({ id });
      const updated = createMockBrand({
        id,
        name: 'Glorious',
        slug: 'glorious',
      });
      prisma.brand.findFirst.mockResolvedValue(brand as never);
      prisma.brand.update.mockResolvedValue(updated as never);

      const result = await service.update(id, { name: 'Glorious' } as never);
      expect(result.name).toBe('Glorious');
    });

    it('should throw ConflictException on slug collision', async () => {
      const id = uuid();
      const brand = createMockBrand({ id });
      const conflict = createMockBrand({ id: uuid(), slug: 'taken' });
      prisma.brand.findFirst
        .mockResolvedValueOnce(brand as never)
        .mockResolvedValueOnce(conflict as never);

      await expect(
        service.update(id, { slug: 'taken' } as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when brand does not exist', async () => {
      prisma.brand.findFirst.mockResolvedValue(null);
      await expect(
        service.update(uuid(), { name: 'x' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete by setting deletedAt', async () => {
      const id = uuid();
      const brand = createMockBrand({ id });
      const deleted = { ...brand, deletedAt: new Date() };
      prisma.brand.findFirst.mockResolvedValue(brand as never);
      prisma.brand.update.mockResolvedValue(deleted as never);

      const result = await service.remove(id);
      expect(result.deletedAt).not.toBeNull();
    });

    it('should throw NotFoundException when brand does not exist', async () => {
      prisma.brand.findFirst.mockResolvedValue(null);
      await expect(service.remove(uuid())).rejects.toThrow(NotFoundException);
    });
  });
});
