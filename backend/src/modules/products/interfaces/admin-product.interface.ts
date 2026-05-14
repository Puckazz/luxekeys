import { Prisma } from '../../../generated/prisma/index.js';

export const ADMIN_PRODUCT_INCLUDE = {
  brand: true,
  category: true,
  images: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
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
      thumbnailImage: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type AdminProductRecord = Prisma.ProductGetPayload<{
  include: typeof ADMIN_PRODUCT_INCLUDE;
}>;

export type AdminProductSummary = Record<
  'all' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK',
  number
>;

export type AdminInventoryStockStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK';

export type AdminInventoryItem = {
  product: AdminProductRecord;
  variantId: string;
  thumbnailUrl: string | null;
  variantSku: string;
  variantColor: string;
  variantSwitchType: string;
  variantStock: number;
  totalStock: number;
  stockStatus: AdminInventoryStockStatus;
};
