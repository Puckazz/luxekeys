import { Injectable } from '@nestjs/common';
import { Prisma, ProductType } from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  AdminInventoryBulkUpdateDto,
  GetAdminInventoryQueryDto,
} from './dto/admin-product.dto.js';
import {
  ADMIN_PRODUCT_INCLUDE,
  AdminInventoryItem,
  AdminInventoryStockStatus,
  AdminProductRecord,
} from './interfaces/admin-product.interface.js';
import { AdminProductsService } from './admin-products.service.js';

const LOW_STOCK_THRESHOLD = 10;
const KEYBOARD_PRODUCT_TYPE = ProductType.KEYBOARD;

@Injectable()
export class AdminInventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminProductsService: AdminProductsService,
  ) {}

  private getAdminStockStatus(stock: number): AdminInventoryStockStatus {
    if (stock <= 0) {
      return 'OUT_OF_STOCK';
    }

    return stock <= LOW_STOCK_THRESHOLD ? 'LOW_STOCK' : 'IN_STOCK';
  }

  private resolveVariantThumbnailUrl(
    product: AdminProductRecord,
  ): (variant: AdminProductRecord['variants'][number]) => string | null {
    const fallbackImage =
      product.thumbnailUrl ??
      product.images.find((image) => image.isPrimary)?.imageUrl ??
      product.images[0]?.imageUrl ??
      null;

    return (variant) => variant.thumbnailImage?.imageUrl ?? fallbackImage;
  }

  async findAdminInventory(query: GetAdminInventoryQueryDto): Promise<{
    data: {
      items: AdminInventoryItem[];
      summary: {
        totalVariants: number;
        lowStockItems: number;
        outOfStockItems: number;
      };
      statusSummary: Record<'all' | AdminInventoryStockStatus, number>;
    };
    pagination: PaginatedResponse<AdminProductRecord>['pagination'];
  }> {
    const categoryIds = query.categoryId
      ? await this.adminProductsService.getCategoryFilterIds(query.categoryId)
      : undefined;
    const baseWhere: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.type && { type: query.type }),
      ...(categoryIds && { categoryId: { in: categoryIds } }),
      ...this.adminProductsService.buildAdminSearchWhere(query.search),
    };

    const products = await this.prisma.product.findMany({
      where: baseWhere,
      include: ADMIN_PRODUCT_INCLUDE,
    });

    const items = products.flatMap((product) => {
      const totalStock =
        this.adminProductsService.getAdminProductTotalStock(product);
      const resolveVariantThumbnailUrl =
        this.resolveVariantThumbnailUrl(product);

      return product.variants.map((variant) => {
        const defaultSwitch = variant.switchOptions[0];
        const stockStatus = this.getAdminStockStatus(variant.stock);

        return {
          product,
          variantId: variant.id,
          thumbnailUrl: resolveVariantThumbnailUrl(variant),
          variantSku: variant.sku,
          variantColor: variant.color ?? '',
          variantOptionName:
            product.type === KEYBOARD_PRODUCT_TYPE
              ? (defaultSwitch?.name ?? variant.name)
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

    const paginated = this.adminProductsService.paginateItems(
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
}
