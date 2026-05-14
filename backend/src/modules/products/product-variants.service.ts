import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductVariant } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service.js';
import { ProductsService } from './products.service.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';

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

  private async ensureVariantThumbnailBelongsToProduct(
    productId: string,
    thumbnailImageId?: string,
  ): Promise<string | null> {
    if (!thumbnailImageId) {
      return null;
    }

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: thumbnailImageId,
        productId,
      },
      select: { id: true },
    });

    if (!image) {
      throw new BadRequestException(
        'Variant thumbnail image must belong to the same product',
      );
    }

    return image.id;
  }

  async create(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.productsService.findOne(productId);
    await this.ensureSkuAvailable(dto.sku);
    const thumbnailImageId = await this.ensureVariantThumbnailBelongsToProduct(
      productId,
      dto.thumbnailImageId,
    );

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

      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          name: dto.name,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice ?? null,
          color: dto.color ?? null,
          layout: dto.layout ?? null,
          stock: dto.stock ?? 0,
          thumbnailImageId,
          isDefault,
          isActive: dto.isActive ?? true,
        },
      });

      await this.syncProductPriceFromDefaultVariant(productId, tx);

      return variant;
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

    const thumbnailImageId =
      dto.thumbnailImageId !== undefined
        ? await this.ensureVariantThumbnailBelongsToProduct(
            productId,
            dto.thumbnailImageId,
          )
        : undefined;

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

      const updated = await tx.productVariant.update({
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
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(thumbnailImageId !== undefined && { thumbnailImageId }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });

      await this.syncProductPriceFromDefaultVariant(productId, tx);

      return updated;
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

      await this.syncProductPriceFromDefaultVariant(productId, tx);

      return removed;
    });
  }

  private async syncProductPriceFromDefaultVariant(
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    let defaultVariant = await tx.productVariant.findFirst({
      where: {
        productId,
        deletedAt: null,
        isActive: true,
        isDefault: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    });

    if (!defaultVariant) {
      defaultVariant = await tx.productVariant.findFirst({
        where: { productId, deletedAt: null, isActive: true },
        orderBy: [{ createdAt: 'asc' }],
      });

      if (!defaultVariant) {
        return;
      }

      await tx.productVariant.update({
        where: { id: defaultVariant.id },
        data: { isDefault: true },
      });
    }

    await tx.productVariant.updateMany({
      where: {
        productId,
        deletedAt: null,
        isDefault: true,
        NOT: { id: defaultVariant.id },
      },
      data: { isDefault: false },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        basePrice: defaultVariant.price,
        compareAtPrice: defaultVariant.compareAtPrice,
      },
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
