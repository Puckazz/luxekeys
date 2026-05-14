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
import { CreateProductDto } from './dto/create-product.dto.js';
import { GetProductsQueryDto } from './dto/get-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
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
