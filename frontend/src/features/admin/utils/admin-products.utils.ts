import type {
  AdminProduct,
  AdminProductVariant,
  AdminVariantStatus,
} from '@/features/admin/types';
import type {
  AdminComputedProductStatus,
  AdminProductSortOption,
} from '@/features/admin/types/admin-products.types';
import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/shared/components/ui/badge';

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

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const getProductTotalStock = (variants: AdminProductVariant[]) => {
  return variants.reduce((total, variant) => total + variant.stock, 0);
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
  const prices = product.variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatCurrency(min);
  }

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

export const buildDefaultVariant = () => {
  return {
    color: '',
    switchType: '',
    sku: '',
    price: 0,
    stock: 0,
    status: 'active' as const,
  };
};
