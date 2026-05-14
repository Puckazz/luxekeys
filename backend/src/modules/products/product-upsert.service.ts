import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, ProductType } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service.js';
import { UpsertAdminProductDto } from './dto/admin-product.dto.js';

const KEYBOARD_PRODUCT_TYPE = ProductType.KEYBOARD;

@Injectable()
export class ProductUpsertService {
  constructor(private readonly prisma: PrismaService) {}

  getAdminProductBasePrice(dto: UpsertAdminProductDto): {
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

  private async ensureVariantThumbnailBelongsToProduct(
    tx: Prisma.TransactionClient,
    productId: string,
    thumbnailImageId?: string,
  ): Promise<string | null> {
    if (!thumbnailImageId) {
      return null;
    }

    const image = await tx.productImage.findFirst({
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

  async syncAdminProductSpecs(
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

  async syncAdminProductVariants(
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
      const thumbnailImageId =
        await this.ensureVariantThumbnailBelongsToProduct(
          tx,
          productId,
          variant.thumbnailImageId,
        );

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
            thumbnailImageId,
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
          thumbnailImageId,
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
}
