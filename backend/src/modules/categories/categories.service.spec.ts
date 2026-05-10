import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockCategory,
  uuid,
} from '../../common/testing/index.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      const category = createMockCategory({
        name: 'Mechanical Keyboards',
        slug: 'mechanical-keyboards',
      });
      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(category as never);

      const result = await service.create({
        name: 'Mechanical Keyboards',
      } as never);

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'mechanical-keyboards' }),
        }),
      );
      expect(result.slug).toBe('mechanical-keyboards');
    });

    it('should use the provided custom slug', async () => {
      const category = createMockCategory({ slug: 'my-slug' });
      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(category as never);

      await service.create({ name: 'Keyboards', slug: 'my-slug' } as never);

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'my-slug' }),
        }),
      );
    });

    it('should throw ConflictException when slug is already taken', async () => {
      const existing = createMockCategory({ slug: 'keyboards' });
      prisma.category.findUnique.mockResolvedValue(existing as never);

      await expect(
        service.create({ name: 'Keyboards' } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated categories with default params', async () => {
      const categories = [createMockCategory(), createMockCategory()];
      prisma.$transaction.mockResolvedValue([2, categories] as never);

      const result = await service.findAll({} as never);

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toMatchObject({ page: 1, limit: 10, total: 2 });
    });

    it('should apply search filter', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);

      await service.findAll({ search: 'mech' } as never);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should apply isActive filter', async () => {
      prisma.$transaction.mockResolvedValue([
        1,
        [createMockCategory({ isActive: false })],
      ] as never);

      const result = await service.findAll({ isActive: false } as never);

      expect(result.data[0].isActive).toBe(false);
    });

    it('should apply custom sort', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);

      await service.findAll({ sortBy: 'name', sortOrder: 'desc' } as never);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a category when found', async () => {
      const id = uuid();
      const category = createMockCategory({ id });
      prisma.category.findFirst.mockResolvedValue(category as never);

      const result = await service.findOne(id);
      expect(result.id).toBe(id);
    });

    it('should throw NotFoundException when category is not found', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne(uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findTree ───────────────────────────────────────────────────────────────

  describe('findTree', () => {
    it('should return root categories with children', async () => {
      const child = createMockCategory({ name: 'Child' });
      const root = createMockCategory({ children: [child] });
      prisma.category.findMany.mockResolvedValue([root] as never);

      const result = await service.findTree();
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
    });
  });

  // ─── findProductsByCategory ─────────────────────────────────────────────────

  describe('findProductsByCategory', () => {
    it('should return paginated products for a valid category', async () => {
      const id = uuid();
      const category = createMockCategory({ id });
      prisma.category.findFirst.mockResolvedValue(category as never);
      prisma.$transaction.mockResolvedValue([0, []] as never);

      const result = await service.findProductsByCategory(id);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });

    it('should throw NotFoundException when category does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findProductsByCategory(uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update name and auto-regenerate slug', async () => {
      const id = uuid();
      const category = createMockCategory({ id });
      const updated = createMockCategory({
        id,
        name: 'New Name',
        slug: 'new-name',
      });
      prisma.category.findFirst.mockResolvedValue(category as never);
      prisma.category.update.mockResolvedValue(updated as never);

      const result = await service.update(id, { name: 'New Name' } as never);
      expect(result.name).toBe('New Name');
    });

    it('should throw ConflictException on slug collision with another record', async () => {
      const id = uuid();
      const category = createMockCategory({ id });
      const conflict = createMockCategory({ id: uuid(), slug: 'taken-slug' });
      prisma.category.findFirst
        .mockResolvedValueOnce(category as never)
        .mockResolvedValueOnce(conflict as never);

      await expect(
        service.update(id, { slug: 'taken-slug' } as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(uuid(), { name: 'x' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete by setting deletedAt', async () => {
      const id = uuid();
      const category = createMockCategory({ id });
      const deleted = { ...category, deletedAt: new Date() };
      prisma.category.findFirst.mockResolvedValue(category as never);
      prisma.category.update.mockResolvedValue(deleted as never);

      const result = await service.remove(id);
      expect(result.deletedAt).not.toBeNull();
      expect(prisma.category.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException when category does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.remove(uuid())).rejects.toThrow(NotFoundException);
    });
  });
});
