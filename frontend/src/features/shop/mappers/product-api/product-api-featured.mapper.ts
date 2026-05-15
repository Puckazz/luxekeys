import type { FeaturedProduct } from '@/features/shop/types';
import type { CustomerProductSummaryApiItem } from '@/features/shop/types/product-api.types';
import { formatCurrency } from '@/lib/formatters';

import { mapApiProductToListItem } from './product-api-list.mapper';
import { getStockBadgeLabel } from './product-api.shared';

type ProductListItem = ReturnType<typeof mapApiProductToListItem>;

const getFeaturedSubtitle = (product: ProductListItem) => {
  if (product.category === 'keyboards') {
    const color = product.defaultColor || 'Default';
    const sw = product.defaultSwitchName || product.switchType;

    return `${color} / ${sw}`;
  }

  return product.defaultVariantName || 'Default';
};

export const mapApiProductToFeaturedProduct = (
  product: CustomerProductSummaryApiItem
): FeaturedProduct => {
  const listItem = mapApiProductToListItem(product);

  return {
    productId: listItem.id,
    variantId: listItem.defaultVariantId ?? listItem.id,
    slug: listItem.slug,
    name: listItem.name,
    subtitle: getFeaturedSubtitle(listItem),
    price: formatCurrency(listItem.price, { minimumFractionDigits: 2 }),
    originalPrice: listItem.originalPrice
      ? formatCurrency(listItem.originalPrice, { minimumFractionDigits: 2 })
      : undefined,
    discountPercentage: listItem.discountPercentage,
    badge: listItem.badge
      ? getStockBadgeLabel(listItem.badge, listItem.stock)
      : null,
    image: listItem.image,
  };
};
