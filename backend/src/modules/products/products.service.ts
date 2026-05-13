import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ProductStatus,
  ProductType,
} from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { toSlug } from '../../common/utils/slugify.util.js';
import { buildOrderBy } from '../../common/utils/query.util.js';
import { PrismaService } from '../database/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { GetProductsQueryDto } from './dto/get-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import {
  AdminInventoryBulkUpdateDto,
  GetAdminInventoryQueryDto,
  GetAdminProductsQueryDto,
  UpsertAdminProductDto,
} from './dto/admin-product.dto.js';
import {
  PRODUCT_DETAIL_INCLUDE,
  PRODUCT_LIST_INCLUDE,
  PRODUCT_REVIEW_INCLUDE,
  ProductDetail,
  ProductDetailWithAverageRating,
  ProductListResponse,
  ProductReview,
  ProductSummaryWithAverageRating,
} from './interfaces/product.interface.js';

const ADMIN_PRODUCT_INCLUDE = {
  brand: true,
  category: true,
  specs: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  variants: {
    where: { deletedAt: null },
    orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'asc' as const }],
    include: {
      switchOptions: {
        where: { deletedAt: null },
        orderBy: [
          { isDefault: 'desc' as const },
          { sortOrder: 'asc' as const },
          { createdAt: 'asc' as const },
        ],
      },
    },
  },
} satisfies Prisma.ProductInclude;

type AdminProductRecord = Prisma.ProductGetPayload<{
  include: typeof ADMIN_PRODUCT_INCLUDE;
}>;

type AdminProductSummary = Record<
  'all' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK',
  number
>;

type AdminInventoryStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const LOW_STOCK_THRESHOLD = 10;
const KEYBOARD_PRODUCT_TYPE = ProductType.KEYBOARD;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAverageRatings(
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const groupedRatings = await this.prisma.review.groupBy({
      by: ['productId'],
      where: {
        deletedAt: null,
        productId: { in: productIds },
      },
      _avg: { rating: true },
    });

    return new Map(
      groupedRatings.map((item) => [
        item.productId,
        item._avg.rating ? Number(item._avg.rating) : 0,
      ]),
    );
  }

  private attachAverageRating<T extends { id: string }>(
    product: T,
    ratings: Map<string, number>,
  ): T & { averageRating: number } {
    return {
      ...product,
      averageRating: ratings.get(product.id) ?? 0,
    };
  }

  private attachAverageRatings<T extends { id: string }>(
    products: T[],
    ratings: Map<string, number>,
  ): Array<T & { averageRating: number }> {
    return products.map((product) =>
      this.attachAverageRating(product, ratings),
    );
  }

  private async getDefaultVariantPrice(productId: string) {
    const defaultVariant = await this.prisma.productVariant.findFirst({
      where: {
        productId,
        deletedAt: null,
        isActive: true,
        isDefault: true,
      },
      orderBy: [{ createdAt: 'asc' }],
      select: { price: true, compareAtPrice: true },
    });

    if (defaultVariant) {
      return defaultVariant;
    }

    return this.prisma.productVariant.findFirst({
      where: { productId, deletedAt: null, isActive: true },
      orderBy: [{ createdAt: 'asc' }],
      select: { price: true, compareAtPrice: true },
    });
  }

  private getAdminStockStatus(stock: number): AdminInventoryStockStatus {
    if (stock <= 0) {
      return 'OUT_OF_STOCK';
    }

    return stock <= LOW_STOCK_THRESHOLD ? 'LOW_STOCK' : 'IN_STOCK';
  }

  private getAdminProductTotalStock(product: AdminProductRecord): number {
    return product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );
  }

  private buildAdminSearchWhere(search?: string): Prisma.ProductWhereInput {
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

  private paginateItems<T>(
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

  private async getCategoryFilterIds(categoryId: string): Promise<string[]> {
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

  private getAdminProductBasePrice(dto: UpsertAdminProductDto): {
    basePrice: string;
    compareAtPrice: string | null;
  } {
    const defaultVariant =
      dto.variants.find(
        (variant) => variant.isDefault && variant.isActive !== false,
      ) ??
      dto.variants.find((variant) => variant.isActive !== false) ??
      dto.variants[0];
    const priceFields = this.getAdminVariantPriceFields(
      dto.type,
      defaultVariant,
    );

    return {
      basePrice: priceFields.price,
      compareAtPrice: priceFields.compareAtPrice,
    };
  }

  private getAdminDefaultSwitchOption(
    variant: UpsertAdminProductDto['variants'][number],
  ) {
    return (
      variant.switchOptions?.find((option) => option.isDefault) ??
      variant.switchOptions?.[0]
    );
  }

  private getAdminVariantPriceFields(
    type: UpsertAdminProductDto['type'],
    variant: UpsertAdminProductDto['variants'][number],
  ): { price: string; compareAtPrice: string | null } {
    if (type === KEYBOARD_PRODUCT_TYPE) {
      const defaultSwitchOption = this.getAdminDefaultSwitchOption(variant);

      if (!defaultSwitchOption) {
        throw new BadRequestException(
          'Keyboard variants require at least one switch option',
        );
      }

      return {
        price: defaultSwitchOption.price.toFixed(2),
        compareAtPrice:
          defaultSwitchOption.originalPrice !== undefined &&
          defaultSwitchOption.originalPrice !== null
            ? defaultSwitchOption.originalPrice.toFixed(2)
            : null,
      };
    }

    return {
      price: variant.price.toFixed(2),
      compareAtPrice:
        variant.originalPrice !== undefined && variant.originalPrice !== null
          ? variant.originalPrice.toFixed(2)
          : null,
    };
  }

  private validateAdminPriceFields(
    type: UpsertAdminProductDto['type'],
    variant: UpsertAdminProductDto['variants'][number],
    variantIndex: number,
  ): void {
    if (
      type !== KEYBOARD_PRODUCT_TYPE &&
      variant.originalPrice !== undefined &&
      variant.originalPrice !== null &&
      variant.originalPrice < variant.price
    ) {
      throw new BadRequestException(
        `Variant ${variantIndex + 1} original price must be greater than or equal to price`,
      );
    }

    if (type !== KEYBOARD_PRODUCT_TYPE) {
      return;
    }

    variant.switchOptions?.forEach((option, optionIndex) => {
      if (
        option.originalPrice !== undefined &&
        option.originalPrice !== null &&
        option.originalPrice < option.price
      ) {
        throw new BadRequestException(
          `Variant ${variantIndex + 1} switch option ${optionIndex + 1} original price must be greater than or equal to price`,
        );
      }
    });
  }

  private getAdminVariantName(
    type: UpsertAdminProductDto['type'],
    variant: UpsertAdminProductDto['variants'][number],
  ) {
    if (type !== KEYBOARD_PRODUCT_TYPE) {
      return variant.switchType?.trim() ?? '';
    }

    return variant.color?.trim() || variant.sku;
  }

  private getAdminVariantStock(
    type: UpsertAdminProductDto['type'],
    variant: UpsertAdminProductDto['variants'][number],
  ): number {
    if (type !== KEYBOARD_PRODUCT_TYPE) {
      return variant.stock;
    }

    return (variant.switchOptions ?? []).reduce(
      (total, option) => total + option.stock,
      0,
    );
  }

  private isKeyboardProductType(type: UpsertAdminProductDto['type']): boolean {
    return type === KEYBOARD_PRODUCT_TYPE;
  }

  private async ensureAdminSkuAvailable(
    sku: string,
    excludeId: string | undefined,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const existing = await tx.productVariant.findFirst({
      where: {
        sku,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`SKU "${sku}" is already taken`);
    }
  }

  private async syncAdminVariantSwitchOptions(
    tx: Prisma.TransactionClient,
    variantId: string,
    switchOptions: NonNullable<
      UpsertAdminProductDto['variants'][number]['switchOptions']
    >,
  ): Promise<void> {
    const existingOptions = await tx.productSwitchOption.findMany({
      where: { variantId, deletedAt: null },
      select: { id: true },
    });
    const existingIds = new Set(existingOptions.map((option) => option.id));
    const incomingIds = new Set(
      switchOptions
        .map((option) => option.id)
        .filter((id): id is string => Boolean(id)),
    );
    const removedIds = existingOptions
      .map((option) => option.id)
      .filter((id) => !incomingIds.has(id));

    if (removedIds.length > 0) {
      await tx.productSwitchOption.updateMany({
        where: { id: { in: removedIds } },
        data: { deletedAt: new Date(), isActive: false, isDefault: false },
      });
    }

    for (const [index, option] of switchOptions.entries()) {
      const data = {
        name: option.name,
        switchType: option.switchType,
        price: option.price.toFixed(2),
        compareAtPrice:
          option.originalPrice !== undefined && option.originalPrice !== null
            ? option.originalPrice.toFixed(2)
            : null,
        stock: option.stock,
        isDefault: option.isDefault ?? index === 0,
        isActive: option.isActive ?? true,
        sortOrder: option.sortOrder ?? index,
      };

      if (option.id && existingIds.has(option.id)) {
        await tx.productSwitchOption.update({
          where: { id: option.id },
          data,
        });
        continue;
      }

      await tx.productSwitchOption.create({
        data: {
          variantId,
          ...data,
        },
      });
    }
  }

  private async archiveAdminVariantSwitchOptions(
    tx: Prisma.TransactionClient,
    variantId: string,
  ): Promise<void> {
    await tx.productSwitchOption.updateMany({
      where: {
        variantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        isDefault: false,
      },
    });
  }

  private async syncAdminProductSpecs(
    tx: Prisma.TransactionClient,
    productId: string,
    specs: UpsertAdminProductDto['specs'] = [],
  ): Promise<void> {
    const existingSpecs = await tx.productSpec.findMany({
      where: { productId },
      select: { id: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const existingIds = new Set(existingSpecs.map((spec) => spec.id));
    const incomingIds = new Set(
      specs.map((spec) => spec.id).filter((id): id is string => Boolean(id)),
    );
    const removedIds = existingSpecs
      .map((spec) => spec.id)
      .filter((id) => !incomingIds.has(id));

    if (removedIds.length > 0) {
      await tx.productSpec.deleteMany({
        where: { id: { in: removedIds } },
      });
    }

    for (const [index, spec] of specs.entries()) {
      const data = {
        specKey: spec.specKey.trim(),
        specValue: spec.specValue.trim(),
        groupName: spec.groupName?.trim() || null,
        sortOrder: spec.sortOrder ?? index,
      };

      if (spec.id && existingIds.has(spec.id)) {
        await tx.productSpec.update({
          where: { id: spec.id },
          data,
        });
        continue;
      }

      await tx.productSpec.create({
        data: {
          productId,
          ...data,
        },
      });
    }
  }

  private async syncAdminProductVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    dto: UpsertAdminProductDto,
  ): Promise<void> {
    const isKeyboardProduct = this.isKeyboardProductType(dto.type);
    if (!dto.variants.some((variant) => variant.isDefault)) {
      dto.variants[0].isDefault = true;
    }

    dto.variants.forEach((variant, index) => {
      this.validateAdminPriceFields(dto.type, variant, index);

      if (isKeyboardProduct) {
        if (!variant.layout?.trim()) {
          throw new BadRequestException(
            `Variant ${index + 1} requires a layout`,
          );
        }

        if (!variant.switchOptions?.length) {
          throw new BadRequestException(
            `Variant ${index + 1} requires at least one switch option`,
          );
        }

        if (!variant.switchOptions.some((option) => option.isDefault)) {
          variant.switchOptions[0].isDefault = true;
        }

        return;
      }

      if (!variant.switchType?.trim()) {
        throw new BadRequestException(
          `Variant ${index + 1} requires a variant name`,
        );
      }
    });
    const existingVariants = await tx.productVariant.findMany({
      where: { productId, deletedAt: null },
      select: { id: true, sku: true },
    });
    const existingIds = new Set(existingVariants.map((variant) => variant.id));
    const incomingIds = new Set(
      dto.variants
        .map((variant) => variant.id)
        .filter((id): id is string => Boolean(id)),
    );

    const removedIds = existingVariants
      .map((variant) => variant.id)
      .filter((id) => !incomingIds.has(id));

    if (removedIds.length > 0) {
      await tx.productVariant.updateMany({
        where: { id: { in: removedIds } },
        data: { deletedAt: new Date(), isActive: false, isDefault: false },
      });

      await tx.productSwitchOption.updateMany({
        where: {
          variantId: { in: removedIds },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
          isDefault: false,
        },
      });
    }

    for (const [index, variant] of dto.variants.entries()) {
      const isActive = variant.isActive ?? true;
      const isDefault = variant.isDefault ?? index === 0;
      const name = this.getAdminVariantName(dto.type, variant);
      const stock = this.getAdminVariantStock(dto.type, variant);
      const priceFields = this.getAdminVariantPriceFields(dto.type, variant);

      await this.ensureAdminSkuAvailable(variant.sku, variant.id, tx);

      if (variant.id && existingIds.has(variant.id)) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: variant.sku,
            name,
            price: priceFields.price,
            compareAtPrice: priceFields.compareAtPrice,
            color: variant.color ?? null,
            layout: isKeyboardProduct ? (variant.layout?.trim() ?? null) : null,
            stock,
            isDefault,
            isActive,
          },
        });

        if (isKeyboardProduct) {
          await this.syncAdminVariantSwitchOptions(
            tx,
            variant.id,
            variant.switchOptions ?? [],
          );
        } else {
          await this.archiveAdminVariantSwitchOptions(tx, variant.id);
        }
        continue;
      }

      const createdVariant = await tx.productVariant.create({
        data: {
          productId,
          sku: variant.sku,
          name,
          price: priceFields.price,
          compareAtPrice: priceFields.compareAtPrice,
          color: variant.color ?? null,
          layout: isKeyboardProduct ? (variant.layout?.trim() ?? null) : null,
          stock,
          isDefault,
          isActive,
        },
      });

      if (isKeyboardProduct) {
        await this.syncAdminVariantSwitchOptions(
          tx,
          createdVariant.id,
          variant.switchOptions ?? [],
        );
      }
    }

    const { basePrice, compareAtPrice } = this.getAdminProductBasePrice(dto);

    await tx.product.update({
      where: { id: productId },
      data: {
        basePrice,
        compareAtPrice,
      },
    });
  }

  async createAdminProduct(
    dto: UpsertAdminProductDto,
  ): Promise<AdminProductRecord> {
    const slug = toSlug(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });

    if (existing) {
      throw new ConflictException(`Slug "${slug}" is already taken`);
    }

    const { basePrice, compareAtPrice } = this.getAdminProductBasePrice(dto);

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

      await this.syncAdminProductSpecs(tx, product.id, dto.specs ?? []);
      await this.syncAdminProductVariants(tx, product.id, dto);

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
        await this.syncAdminProductSpecs(tx, id, dto.specs);
      }
      await this.syncAdminProductVariants(tx, id, dto);
    });

    return this.findAdminProductRecord(id);
  }

  private async findAdminProductRecord(
    id: string,
  ): Promise<AdminProductRecord> {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: ADMIN_PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async archiveAdminProduct(id: string): Promise<AdminProductRecord> {
    const existing = await this.findAdminProductRecord(id);

    if (existing.deletedAt) {
      return existing;
    }

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.INACTIVE },
    });

    return this.findAdminProductRecord(id);
  }

  async restoreAdminProduct(id: string): Promise<AdminProductRecord> {
    await this.findAdminProductRecord(id);

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null, status: ProductStatus.INACTIVE },
    });

    return this.findAdminProductRecord(id);
  }

  async findAdminInventory(query: GetAdminInventoryQueryDto): Promise<{
    data: {
      items: Array<{
        product: AdminProductRecord;
        variantId: string;
        variantSku: string;
        variantColor: string;
        variantSwitchType: string;
        variantStock: number;
        totalStock: number;
        stockStatus: AdminInventoryStockStatus;
      }>;
      summary: {
        totalVariants: number;
        lowStockItems: number;
        outOfStockItems: number;
      };
      statusSummary: Record<'all' | AdminInventoryStockStatus, number>;
    };
    pagination: PaginatedResponse<AdminProductRecord>['pagination'];
  }> {
    const baseWhere: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.type && { type: query.type }),
      ...this.buildAdminSearchWhere(query.search),
    };

    const products = await this.prisma.product.findMany({
      where: baseWhere,
      include: ADMIN_PRODUCT_INCLUDE,
    });

    const items = products.flatMap((product) => {
      const totalStock = this.getAdminProductTotalStock(product);

      return product.variants.map((variant) => {
        const defaultSwitch = variant.switchOptions[0];
        const stockStatus = this.getAdminStockStatus(variant.stock);

        return {
          product,
          variantId: variant.id,
          variantSku: variant.sku,
          variantColor: variant.color ?? '',
          variantSwitchType:
            product.type === KEYBOARD_PRODUCT_TYPE
              ? (defaultSwitch?.switchType ?? variant.name)
              : variant.name,
          variantStock: variant.stock,
          totalStock,
          stockStatus,
        };
      });
    });

    const statusSummary = items.reduce<
      Record<'all' | AdminInventoryStockStatus, number>
    >(
      (summary, item) => {
        summary.all += 1;
        summary[item.stockStatus] += 1;
        return summary;
      },
      {
        all: 0,
        IN_STOCK: 0,
        LOW_STOCK: 0,
        OUT_OF_STOCK: 0,
      },
    );

    const filtered = query.status
      ? items.filter((item) => item.stockStatus === query.status)
      : items;

    const sorted = [...filtered].sort((left, right) => {
      const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

      if (query.sortBy === 'name') {
        return left.product.name.localeCompare(right.product.name) * sortOrder;
      }

      if (query.sortBy === 'stock') {
        return (left.variantStock - right.variantStock) * sortOrder;
      }

      return (
        (left.product.updatedAt.getTime() - right.product.updatedAt.getTime()) *
        sortOrder
      );
    });

    const paginated = this.paginateItems(
      sorted,
      query.page ?? 1,
      query.limit ?? 7,
    );

    return {
      data: {
        items: paginated.data,
        summary: {
          totalVariants: items.length,
          lowStockItems: statusSummary.LOW_STOCK,
          outOfStockItems: statusSummary.OUT_OF_STOCK,
        },
        statusSummary,
      },
      pagination: paginated.pagination,
    };
  }

  async bulkUpdateAdminInventoryStock(
    dto: AdminInventoryBulkUpdateDto,
  ): Promise<{ updatedCount: number }> {
    const updatedCount = await this.prisma.$transaction(async (tx) => {
      let total = 0;

      for (const update of dto.updates) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: update.variantId,
            productId: update.productId,
            deletedAt: null,
          },
          data: { stock: update.stock },
        });

        if (result.count > 0) {
          await tx.productSwitchOption.updateMany({
            where: {
              variantId: update.variantId,
              deletedAt: null,
            },
            data: { stock: update.stock },
          });
        }

        total += result.count;
      }

      return total;
    });

    return {
      updatedCount,
    };
  }

  async create(dto: CreateProductDto): Promise<ProductDetail> {
    const slug = dto.slug ?? toSlug(dto.name);

    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" is already taken`);
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        type: dto.type,
        status: dto.status ?? 'ACTIVE',
        brandId: dto.brandId ?? null,
        categoryId: dto.categoryId ?? null,
        basePrice: dto.basePrice,
        compareAtPrice: dto.compareAtPrice ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        tags: dto.tags ?? [],
        isFeatured: dto.isFeatured ?? false,
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async findAll(query: GetProductsQueryDto): Promise<ProductListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ProductWhereInput = { deletedAt: null };

    if (query.type?.length) baseWhere.type = { in: query.type };
    if (query.status) baseWhere.status = query.status;
    if (query.brandId?.length) baseWhere.brandId = { in: query.brandId };
    if (query.categoryId) baseWhere.categoryId = query.categoryId;
    if (query.categorySlug?.length) {
      baseWhere.category = {
        is: { slug: { in: query.categorySlug }, deletedAt: null },
      };
    }
    if (query.isFeatured !== undefined) baseWhere.isFeatured = query.isFeatured;

    if (query.keycapProfile?.length) {
      baseWhere.tags = {
        hasSome: query.keycapProfile.map((p) => `${p} Profile`),
      };
    }

    if (query.layout?.length || query.switchType?.length) {
      const variantWhere: Prisma.ProductVariantWhereInput = {
        deletedAt: null,
        isActive: true,
      };

      if (query.layout?.length) {
        variantWhere.layout = { in: query.layout };
      }

      if (query.switchType?.length) {
        variantWhere.switchOptions = {
          some: {
            switchType: { in: query.switchType },
          },
        };
      }

      baseWhere.variants = {
        some: variantWhere,
      };
    }

    if (query.search) {
      baseWhere.name = { contains: query.search, mode: 'insensitive' };
    }

    const where: Prisma.ProductWhereInput = { ...baseWhere };

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined)
        where.basePrice.gte = query.minPrice.toString();
      if (query.maxPrice !== undefined)
        where.basePrice.lte = query.maxPrice.toString();
    }

    const orderBy =
      query.sortBy === 'isFeatured'
        ? [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }]
        : buildOrderBy<Prisma.ProductOrderByWithRelationInput>(
            ['basePrice', 'name', 'createdAt'],
            'createdAt',
            query.sortBy,
            query.sortOrder,
          );

    const [total, data, priceAggregate] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: PRODUCT_LIST_INCLUDE,
      }),
      this.prisma.product.aggregate({
        where: baseWhere,
        _max: { basePrice: true },
      }),
    ]);

    const maxPrice = priceAggregate._max.basePrice
      ? Number(priceAggregate._max.basePrice)
      : 0;

    const ratings = await this.getAverageRatings(
      data.map((product) => product.id),
    );

    return {
      data: {
        items: this.attachAverageRatings(data, ratings),
        priceBounds: {
          min: 0,
          max: Number.isFinite(maxPrice) ? Math.ceil(maxPrice) : 0,
        },
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findFeatured(): Promise<{ data: ProductSummaryWithAverageRating[] }> {
    const data = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: PRODUCT_LIST_INCLUDE,
    });
    const ratings = await this.getAverageRatings(
      data.map((product) => product.id),
    );

    return { data: this.attachAverageRatings(data, ratings) };
  }

  async findOne(id: string): Promise<ProductDetailWithAverageRating> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const ratings = await this.getAverageRatings([product.id]);

    return this.attachAverageRating(product, ratings);
  }

  async findBySlug(slug: string): Promise<ProductDetailWithAverageRating> {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    const ratings = await this.getAverageRatings([product.id]);

    return this.attachAverageRating(product, ratings);
  }

  async findVariants(id: string) {
    await this.findOne(id);

    return this.prisma.productVariant.findMany({
      where: { productId: id, deletedAt: null, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findReviews(
    id: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<ProductReview>> {
    await this.findOne(id);

    const skip = (page - 1) * limit;
    const where: Prisma.ReviewWhereInput = { productId: id, deletedAt: null };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: PRODUCT_REVIEW_INCLUDE,
      }),
    ]);

    return {
      data: data as ProductReview[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    await this.findOne(id);

    const nextSlug = dto.slug !== undefined ? toSlug(dto.slug) : undefined;

    if (nextSlug !== undefined) {
      const conflict = await this.prisma.product.findFirst({
        where: {
          slug: nextSlug,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (conflict) {
        throw new ConflictException(`Slug "${nextSlug}" is already taken`);
      }
    }

    const defaultVariantPrice = await this.getDefaultVariantPrice(id);
    const data: Prisma.ProductUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(nextSlug !== undefined && { slug: nextSlug }),
      ...(dto.shortDescription !== undefined && {
        shortDescription: dto.shortDescription,
      }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.brandId !== undefined && { brandId: dto.brandId }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
      ...(dto.compareAtPrice !== undefined && {
        compareAtPrice: dto.compareAtPrice,
      }),
      ...(dto.thumbnailUrl !== undefined && {
        thumbnailUrl: dto.thumbnailUrl,
      }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
    };

    if (defaultVariantPrice) {
      data.basePrice = defaultVariantPrice.price;
      data.compareAtPrice = defaultVariantPrice.compareAtPrice;
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async remove(id: string): Promise<ProductDetail> {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }
}
