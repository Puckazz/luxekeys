import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { toSlug } from '../../common/utils/slugify.util.js';
import { buildOrderBy } from '../../common/utils/query.util.js';
import { PrismaService } from '../database/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import {
  GetAdminCategoriesQueryDto,
  GetCategoriesQueryDto,
} from './dto/get-categories-query.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import {
  CATEGORY_DETAIL_INCLUDE,
  CATEGORY_LIST_INCLUDE,
  CATEGORY_TREE_INCLUDE,
  CategoryDetail,
  CategorySummary,
  CategoryTree,
} from './interfaces/category.interface.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildAdminCategorySummary(
    categories: CategorySummary[],
  ): Record<'all' | 'active' | 'draft' | 'archived', number> {
    return categories.reduce(
      (summary, category) => {
        if (category.deletedAt) {
          summary.archived += 1;
          return summary;
        }

        summary.all += 1;

        if (category.isActive) {
          summary.active += 1;
          return summary;
        }

        summary.draft += 1;
        return summary;
      },
      {
        all: 0,
        active: 0,
        draft: 0,
        archived: 0,
      },
    );
  }

  private sortAdminCategories(
    categories: CategorySummary[],
    sort: GetAdminCategoriesQueryDto['sort'],
  ): CategorySummary[] {
    const next = [...categories];

    if (sort === 'name-asc') {
      return next.sort((left, right) => left.name.localeCompare(right.name));
    }

    if (sort === 'products-desc') {
      return next.sort(
        (left, right) => right._count.products - left._count.products,
      );
    }

    return next.sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  private async findAdminOne(id: string): Promise<CategoryDetail> {
    const category = await this.prisma.category.findFirst({
      where: { id },
      include: CATEGORY_DETAIL_INCLUDE,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDetail> {
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
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        isActive: dto.isActive ?? true,
      },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async findAll(
    query: GetCategoriesQueryDto,
  ): Promise<PaginatedResponse<CategorySummary>> {
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

  async findTree(): Promise<CategoryTree[]> {
    return this.prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      orderBy: { name: 'asc' },
      include: CATEGORY_TREE_INCLUDE,
    });
  }

  async findOne(id: string): Promise<CategoryDetail> {
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

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDetail> {
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
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async remove(id: string): Promise<CategoryDetail> {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async findAdminCategories(query: GetAdminCategoriesQueryDto): Promise<{
    data: {
      items: CategorySummary[];
      summary: Record<'all' | 'active' | 'draft' | 'archived', number>;
    };
    pagination: PaginatedResponse<CategorySummary>['pagination'];
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 8;
    const search = query.search?.trim();
    const categories = await this.prisma.category.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: CATEGORY_LIST_INCLUDE,
    });
    const summary = this.buildAdminCategorySummary(categories);
    const filtered = categories.filter((category) => {
      if (query.status === 'archived') {
        return Boolean(category.deletedAt);
      }

      if (category.deletedAt) {
        return false;
      }

      if (query.status === 'active') {
        return category.isActive;
      }

      if (query.status === 'draft') {
        return !category.isActive;
      }

      return true;
    });
    const sorted = this.sortAdminCategories(filtered, query.sort);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;

    return {
      data: {
        items: sorted.slice(start, start + limit),
        summary,
      },
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async createAdminCategory(dto: CreateCategoryDto): Promise<CategoryDetail> {
    return this.create(dto);
  }

  async updateAdminCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDetail> {
    return this.update(id, dto);
  }

  async archiveAdminCategory(id: string): Promise<CategoryDetail> {
    const category = await this.findAdminOne(id);

    if (category.deletedAt) {
      return category;
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }

  async restoreAdminCategory(id: string): Promise<CategoryDetail> {
    await this.findAdminOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null, isActive: false },
      include: CATEGORY_DETAIL_INCLUDE,
    });
  }
}
