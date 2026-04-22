import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductVariant } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service';
import { ProductsService } from './products.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(productId: string): Promise<{ data: ProductVariant[] }> {
    await this.productsService.findOne(productId);

    const data = await this.prisma.productVariant.findMany({
      where: { productId, deletedAt: null, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return { data };
  }

  async create(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.productsService.findOne(productId);
    await this.ensureSkuAvailable(dto.sku);

    return this.prisma.$transaction(async (tx) => {
      const activeVariantCount = await tx.productVariant.count({
        where: { productId, deletedAt: null, isActive: true },
      });

      const isDefault = dto.isDefault ?? activeVariantCount === 0;

      if (isDefault) {
        await tx.productVariant.updateMany({
          where: { productId, deletedAt: null, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          name: dto.name,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice ?? null,
          color: dto.color ?? null,
          layout: dto.layout ?? null,
          switchType: dto.switchType ?? null,
          connectivity: dto.connectivity ?? null,
          stock: dto.stock ?? 0,
          isDefault,
          isActive: dto.isActive ?? true,
        },
      });
    });
  }

  async update(
    productId: string,
    id: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    const variant = await this.findOne(productId, id);

    if (dto.sku && dto.sku !== variant.sku) {
      await this.ensureSkuAvailable(dto.sku, id);
    }

    return this.prisma.$transaction(async (tx) => {
      const nextIsDefault = dto.isDefault ?? variant.isDefault;

      if (nextIsDefault) {
        await tx.productVariant.updateMany({
          where: {
            productId,
            deletedAt: null,
            isDefault: true,
            NOT: { id },
          },
          data: { isDefault: false },
        });
      }

      return tx.productVariant.update({
        where: { id },
        data: {
          ...(dto.sku !== undefined && { sku: dto.sku }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.compareAtPrice !== undefined && {
            compareAtPrice: dto.compareAtPrice,
          }),
          ...(dto.color !== undefined && { color: dto.color }),
          ...(dto.layout !== undefined && { layout: dto.layout }),
          ...(dto.switchType !== undefined && { switchType: dto.switchType }),
          ...(dto.connectivity !== undefined && {
            connectivity: dto.connectivity,
          }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
    });
  }

  async remove(productId: string, id: string): Promise<ProductVariant> {
    await this.findOne(productId, id);

    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.productVariant.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false, isDefault: false },
      });

      const nextDefault = await tx.productVariant.findFirst({
        where: { productId, deletedAt: null, isActive: true },
        orderBy: [{ createdAt: 'asc' }],
      });

      if (nextDefault) {
        await tx.productVariant.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }

      return removed;
    });
  }

  private async findOne(
    productId: string,
    id: string,
  ): Promise<ProductVariant> {
    await this.productsService.findOne(productId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id, productId, deletedAt: null },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID "${id}" not found`);
    }

    return variant;
  }

  private async ensureSkuAvailable(
    sku: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.ProductVariantWhereInput = {
      sku,
      ...(excludeId && { NOT: { id: excludeId } }),
    };

    const existing = await this.prisma.productVariant.findFirst({ where });

    if (existing) {
      throw new ConflictException(`SKU "${sku}" is already taken`);
    }
  }
}
