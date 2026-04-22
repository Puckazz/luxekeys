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
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PRODUCT_DETAIL_INCLUDE,
  PRODUCT_LIST_INCLUDE,
  ProductDetail,
  ProductSummary,
} from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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
        isFeatured: dto.isFeatured ?? false,
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async findAll(
    query: GetProductsQueryDto,
  ): Promise<PaginatedResponse<ProductSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.brandId) where.brandId = query.brandId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined)
        where.basePrice.gte = query.minPrice.toString();
      if (query.maxPrice !== undefined)
        where.basePrice.lte = query.maxPrice.toString();
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const orderBy = buildOrderBy<Prisma.ProductOrderByWithRelationInput>(
      ['basePrice', 'name', 'createdAt'],
      'createdAt',
      query.sortBy,
      query.sortOrder,
    );

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: PRODUCT_LIST_INCLUDE,
      }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findFeatured(): Promise<{ data: ProductSummary[] }> {
    const data = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: PRODUCT_LIST_INCLUDE,
    });
    return { data };
  }

  async findOne(id: string): Promise<ProductDetail> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<ProductDetail> {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
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
  ): Promise<
    PaginatedResponse<
      Prisma.ReviewGetPayload<{
        include: {
          user: { select: { id: true; fullName: true; avatarUrl: true } };
        };
      }>
    >
  > {
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
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
    ]);

    return {
      data,
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
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
    };

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
