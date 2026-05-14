import type {
  AdminProduct,
  AdminProductSpec,
  AdminProductVariant,
  AdminVariantStatus,
} from '@/features/admin/types';
import type {
  AdminComputedProductStatus,
  AdminProductSpecFormValue,
  AdminProductVariantFormValue,
  AdminProductSortOption,
} from '@/features/admin/types/admin-products.types';
import type {
  AdminInventorySortOption,
  AdminInventoryStockStatus,
} from '@/features/admin/types/admin-inventory.types';
import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/shared/components/ui/badge';
import { LOW_STOCK_THRESHOLD } from '@/features/admin/utils/admin-products.constants';
import { formatCurrency as formatSharedCurrency } from '@/lib/formatters';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const adminProductStatusLabelByValue: Record<
  AdminComputedProductStatus,
  string
> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
  'out-of-stock': 'Out of stock',
};

export const adminVariantStatusLabelByValue: Record<
  AdminVariantStatus,
  string
> = {
  active: 'Active',
  draft: 'Draft',
};

export const adminProductStatusBadgeByValue: Record<
  AdminComputedProductStatus,
  BadgeVariant
> = {
  active: 'success',
  draft: 'warning',
  archived: 'destructive',
  'out-of-stock': 'default',
};

export const adminVariantStatusBadgeByValue: Record<
  AdminVariantStatus,
  BadgeVariant
> = {
  active: 'success',
  draft: 'warning',
};

export const adminProductSortLabelByValue: Record<
  AdminProductSortOption,
  string
> = {
  newest: 'Newest',
  'name-asc': 'Name (A-Z)',
  'stock-desc': 'Stock (high-low)',
  'price-asc': 'Price (low-high)',
  'price-desc': 'Price (high-low)',
};

export const adminInventoryStockStatusLabelByValue: Record<
  AdminInventoryStockStatus,
  string
> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

export const adminInventoryStockStatusBadgeByValue: Record<
  AdminInventoryStockStatus,
  BadgeVariant
> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'destructive',
};

export const adminInventorySortLabelByValue: Record<
  AdminInventorySortOption,
  string
> = {
  'updated-desc': 'Last updated',
  'name-asc': 'Name (A-Z)',
  'stock-asc': 'Stock (low-high)',
  'stock-desc': 'Stock (high-low)',
};

export const formatCurrency = (value: number) => {
  return formatSharedCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const getProductTotalStock = (variants: AdminProductVariant[]) => {
  return variants.reduce((total, variant) => total + variant.stock, 0);
};

export const getInventoryStockStatus = (
  quantity: number
): AdminInventoryStockStatus => {
  if (quantity <= 0) {
    return 'out-of-stock';
  }

  return quantity <= LOW_STOCK_THRESHOLD ? 'low-stock' : 'in-stock';
};

export const getComputedProductStatus = (
  product: AdminProduct
): AdminComputedProductStatus => {
  if (product.status === 'archived') {
    return 'archived';
  }

  return getProductTotalStock(product.variants) <= 0
    ? 'out-of-stock'
    : product.status;
};

export const getProductPriceRangeLabel = (product: AdminProduct) => {
  const prices =
    product.productType === 'keyboards'
      ? product.variants.flatMap((variant) => {
          return variant.switchOptions.length > 0
            ? variant.switchOptions.map((option) => option.price)
            : [variant.price];
        })
      : product.variants.map((variant) => variant.price);

  if (prices.length === 0) {
    return formatCurrency(0);
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatCurrency(min);
  }

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

export const buildDefaultProductSpec = (): AdminProductSpecFormValue => {
  return {
    groupName: '',
    specKey: '',
    specValue: '',
  };
};

export const normalizeAdminProductSpec = (
  spec: AdminProductSpec
): AdminProductSpecFormValue => {
  return {
    id: spec.id,
    groupName: spec.groupName,
    specKey: spec.specKey,
    specValue: spec.specValue,
  };
};

export const buildDefaultVariant = (): AdminProductVariantFormValue => {
  return {
    thumbnailImageId: undefined,
    color: '',
    layout: '',
    switchType: '',
    sku: '',
    originalPrice: '',
    price: 0,
    stock: 0,
    isDefault: true,
    status: 'active' as const,
    switchOptions: [
      {
        name: '',
        switchType: '',
        originalPrice: '',
        price: 0,
        stock: 0,
        isDefault: true,
        status: 'active' as const,
      },
    ],
  };
};
