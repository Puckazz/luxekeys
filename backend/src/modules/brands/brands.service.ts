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
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { GetBrandsQueryDto } from './dto/get-brands-query.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import {
  BRAND_DETAIL_INCLUDE,
  BRAND_LIST_INCLUDE,
  BrandDetail,
  BrandSummary,
} from './interfaces/brand.interface.js';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto): Promise<BrandDetail> {
    const slug = dto.slug ?? toSlug(dto.name);

    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" is already taken`);
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        logoUrl: dto.logoUrl ?? null,
        isActive: dto.isActive ?? true,
      },
      include: BRAND_DETAIL_INCLUDE,
    });
  }

  async findAll(
    query: GetBrandsQueryDto,
  ): Promise<PaginatedResponse<BrandSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = buildOrderBy<Prisma.BrandOrderByWithRelationInput>(
      ['name', 'updatedAt', 'createdAt'],
      'createdAt',
      query.sortBy,
      query.sortOrder,
    );

    const [total, data] = await this.prisma.$transaction([
      this.prisma.brand.count({ where }),
      this.prisma.brand.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: BRAND_LIST_INCLUDE,
      }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<BrandDetail> {
    const brand = await this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: BRAND_DETAIL_INCLUDE,
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }

    return brand;
  }

  async findProductsByBrand(id: string, page = 1, limit = 20) {
    await this.findOne(id);

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      brandId: id,
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
          category: true,
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

  async update(id: string, dto: UpdateBrandDto): Promise<BrandDetail> {
    await this.findOne(id);

    if (dto.slug) {
      const conflict = await this.prisma.brand.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined
          ? { slug: dto.slug }
          : dto.name !== undefined
            ? { slug: toSlug(dto.name) }
            : {}),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: BRAND_DETAIL_INCLUDE,
    });
  }

  async remove(id: string): Promise<BrandDetail> {
    await this.findOne(id);

    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: BRAND_DETAIL_INCLUDE,
    });
  }
}
