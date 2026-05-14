import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { toSlug } from '../../common/utils/slugify.util.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  GetAdminProductsQueryDto,
  UpsertAdminProductDto,
} from './dto/admin-product.dto.js';
import {
  ADMIN_PRODUCT_INCLUDE,
  AdminProductRecord,
  AdminProductSummary,
} from './interfaces/admin-product.interface.js';
import { ProductUpsertService } from './product-upsert.service.js';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUpsertService: ProductUpsertService,
  ) {}

  getAdminProductTotalStock(product: AdminProductRecord): number {
    return product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );
  }

  buildAdminSearchWhere(search?: string): Prisma.ProductWhereInput {
    if (!search?.trim()) {
      return {};
    }

    const normalizedSearch = search.trim();

    return {
      OR: [
        { name: { contains: normalizedSearch, mode: 'insensitive' } },
        { description: { contains: normalizedSearch, mode: 'insensitive' } },
        {
          variants: {
            some: {
              deletedAt: null,
              OR: [
                { sku: { contains: normalizedSearch, mode: 'insensitive' } },
                { name: { contains: normalizedSearch, mode: 'insensitive' } },
                { color: { contains: normalizedSearch, mode: 'insensitive' } },
                {
                  switchOptions: {
                    some: {
                      deletedAt: null,
                      switchType: {
                        contains: normalizedSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    };
  }

  private buildAdminSummary(
    products: AdminProductRecord[],
  ): AdminProductSummary {
    return products.reduce<AdminProductSummary>(
      (summary, product) => {
        if (product.deletedAt) {
          summary.ARCHIVED += 1;
          return summary;
        }

        summary.all += 1;
        summary[product.status] += 1;

        if (this.getAdminProductTotalStock(product) <= 0) {
          summary.OUT_OF_STOCK += 1;
        }

        return summary;
      },
      {
        all: 0,
        ACTIVE: 0,
        INACTIVE: 0,
        ARCHIVED: 0,
        OUT_OF_STOCK: 0,
      },
    );
  }

  private sortAdminProducts(
    products: AdminProductRecord[],
    query: GetAdminProductsQueryDto,
  ): AdminProductRecord[] {
    const next = [...products];
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    if (query.sortBy === 'name') {
      return next.sort(
        (left, right) => left.name.localeCompare(right.name) * sortOrder,
      );
    }

    if (query.sortBy === 'stock') {
      return next.sort(
        (left, right) =>
          (this.getAdminProductTotalStock(left) -
            this.getAdminProductTotalStock(right)) *
          sortOrder,
      );
    }

    if (query.sortBy === 'basePrice') {
      return next.sort(
        (left, right) =>
          (Number(left.basePrice) - Number(right.basePrice)) * sortOrder,
      );
    }

    return next.sort(
      (left, right) =>
        (left.createdAt.getTime() - right.createdAt.getTime()) * sortOrder,
    );
  }

  paginateItems<T>(
    items: T[],
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;

    return {
      data: items.slice(start, start + limit),
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getCategoryFilterIds(categoryId: string): Promise<string[]> {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, parentId: true },
    });
    const categoryIds = new Set<string>([categoryId]);
    const childrenByParentId = categories.reduce<Map<string, string[]>>(
      (childrenMap, category) => {
        if (!category.parentId) {
          return childrenMap;
        }

        const children = childrenMap.get(category.parentId) ?? [];
        children.push(category.id);
        childrenMap.set(category.parentId, children);

        return childrenMap;
      },
      new Map(),
    );
    const stack = [...(childrenByParentId.get(categoryId) ?? [])];

    while (stack.length > 0) {
      const currentId = stack.pop();

      if (!currentId || categoryIds.has(currentId)) {
        continue;
      }

      categoryIds.add(currentId);
      stack.push(...(childrenByParentId.get(currentId) ?? []));
    }

    return [...categoryIds];
  }

  async findAdminProducts(query: GetAdminProductsQueryDto): Promise<{
    data: { items: AdminProductRecord[]; summary: AdminProductSummary };
    pagination: PaginatedResponse<AdminProductRecord>['pagination'];
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;
    const categoryIds = query.categoryId
      ? await this.getCategoryFilterIds(query.categoryId)
      : undefined;
    const baseWhere: Prisma.ProductWhereInput = {
      ...this.buildAdminSearchWhere(query.search),
      ...(query.type && { type: query.type }),
      ...(categoryIds && { categoryId: { in: categoryIds } }),
    };

    const summaryProducts = await this.prisma.product.findMany({
      where: baseWhere,
      include: ADMIN_PRODUCT_INCLUDE,
    });
    const summary = this.buildAdminSummary(summaryProducts);

    const filtered = summaryProducts.filter((product) => {
      if (query.status === 'ARCHIVED') {
        return Boolean(product.deletedAt);
      }

      if (product.deletedAt) {
        return false;
      }

      if (query.status === 'OUT_OF_STOCK') {
        return this.getAdminProductTotalStock(product) <= 0;
      }

      if (query.status) {
        return product.status === query.status;
      }

      return true;
    });

    const sorted = this.sortAdminProducts(filtered, query);
    const paginated = this.paginateItems(sorted, page, limit);

    return {
      data: {
        items: paginated.data,
        summary,
      },
      pagination: paginated.pagination,
    };
  }

  async createAdminProduct(
    dto: UpsertAdminProductDto,
  ): Promise<AdminProductRecord> {
    const slug = toSlug(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });

    if (existing) {
      throw new ConflictException(`Slug "${slug}" is already taken`);
    }

    const { basePrice, compareAtPrice } =
      this.productUpsertService.getAdminProductBasePrice(dto);

    const productId = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          shortDescription: dto.shortDescription,
          description: dto.description,
          type: dto.type,
          status: dto.status ?? ProductStatus.ACTIVE,
          brandId: dto.brandId ?? null,
          categoryId: dto.categoryId ?? null,
          basePrice,
          compareAtPrice,
          thumbnailUrl: dto.thumbnailUrl ?? null,
          tags: dto.tags ?? [],
          isFeatured: dto.isFeatured ?? false,
        },
        select: { id: true },
      });

      await this.productUpsertService.syncAdminProductSpecs(
        tx,
        product.id,
        dto.specs ?? [],
      );
      await this.productUpsertService.syncAdminProductVariants(
        tx,
        product.id,
        dto,
      );

      return product.id;
    });

    return this.findAdminProductRecord(productId);
  }

  async updateAdminProduct(
    id: string,
    dto: UpsertAdminProductDto,
  ): Promise<AdminProductRecord> {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, brandId: true, categoryId: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const nextSlug = toSlug(dto.name);
    const conflict = await this.prisma.product.findFirst({
      where: {
        slug: nextSlug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException(`Slug "${nextSlug}" is already taken`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: nextSlug,
          shortDescription: dto.shortDescription,
          description: dto.description,
          type: dto.type,
          status: dto.status ?? ProductStatus.ACTIVE,
          brandId: dto.brandId !== undefined ? dto.brandId : existing.brandId,
          categoryId:
            dto.categoryId !== undefined ? dto.categoryId : existing.categoryId,
          thumbnailUrl: dto.thumbnailUrl ?? null,
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        },
      });

      if (dto.specs !== undefined) {
        await this.productUpsertService.syncAdminProductSpecs(
          tx,
          id,
          dto.specs,
        );
      }
      await this.productUpsertService.syncAdminProductVariants(tx, id, dto);
    });

    return this.findAdminProductRecord(id);
  }

  async findAdminProductRecord(id: string): Promise<AdminProductRecord> {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: ADMIN_PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async restoreAdminProduct(id: string): Promise<AdminProductRecord> {
    await this.findAdminProductRecord(id);

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null, status: ProductStatus.INACTIVE },
    });

    return this.findAdminProductRecord(id);
  }
}
