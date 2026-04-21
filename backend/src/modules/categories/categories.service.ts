import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces';
import { toSlug } from '../../common/utils/slugify.util';
import { buildOrderBy } from '../../common/utils/query.util';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CATEGORY_DETAIL_INCLUDE,
  CATEGORY_LIST_INCLUDE,
  CategoryWithChildren,
} from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryWithChildren> {
    const slug = dto.slug ?? toSlug(dto.name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" is already taken`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId ?? null,
        isActive: dto.isActive ?? true,
      },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async findAll(
    query: GetCategoriesQueryDto,
  ): Promise<PaginatedResponse<CategoryWithChildren>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = buildOrderBy<Prisma.CategoryOrderByWithRelationInput>(
      ['name', 'updatedAt', 'createdAt'],
      'createdAt',
      query.sortBy,
      query.sortOrder,
    );

    const [total, data] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: CATEGORY_LIST_INCLUDE,
      }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTree(): Promise<CategoryWithChildren[]> {
    return this.prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          include: {
            children: {
              where: { deletedAt: null },
              orderBy: { name: 'asc' },
              include: { _count: { select: { products: true } } },
            },
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: string): Promise<CategoryWithChildren> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: CATEGORY_DETAIL_INCLUDE,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async findProductsByCategory(id: string, page = 1, limit = 20) {
    await this.findOne(id);

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      categoryId: id,
      deletedAt: null,
      status: 'ACTIVE',
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { variants: true, reviews: true } },
        },
      }),
    ]);

    return {
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryWithChildren> {
    await this.findOne(id);

    if (dto.slug) {
      const conflict = await this.prisma.category.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined
          ? { slug: dto.slug }
          : dto.name !== undefined
            ? { slug: toSlug(dto.name) }
            : {}),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async remove(id: string): Promise<CategoryWithChildren> {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }
}
