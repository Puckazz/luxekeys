import type { ProductListItem } from '@/features/shop/types';
import type { CustomerProductSummaryApiItem } from '@/features/shop/types/product-api.types';

import {
  calculateDiscountPercentage,
  CATEGORY_BY_PRODUCT_TYPE,
  DEFAULT_CASE_MATERIAL,
  DEFAULT_LAYOUT,
  DEFAULT_SWITCH_TYPE,
  getDefaultVariant,
  getProductBadge,
  getProductImage,
  isProductLayout,
  isProductSwitchType,
  toNumber,
} from './product-api.shared';

export const mapApiProductToListItem = (
  product: CustomerProductSummaryApiItem
): ProductListItem => {
  const defaultVariant = getDefaultVariant(product);
  const price = toNumber(defaultVariant?.price) || toNumber(product.basePrice);
  const compareAtPrice =
    toNumber(defaultVariant?.compareAtPrice) ||
    toNumber(product.compareAtPrice);
  const stock = defaultVariant?.stock ?? 0;
  const layout = isProductLayout(defaultVariant?.layout)
    ? defaultVariant.layout
    : DEFAULT_LAYOUT;
  const switchType = isProductSwitchType(defaultVariant?.switchType)
    ? defaultVariant.switchType
    : DEFAULT_SWITCH_TYPE;

  return {
    id: product.id,
    slug: product.slug,
    category: CATEGORY_BY_PRODUCT_TYPE[product.type],
    name: product.name,
    brand: product.brand?.name ?? 'LuxeKeys',
    description: product.shortDescription ?? product.description ?? '',
    price,
    discountPercentage: calculateDiscountPercentage(price, compareAtPrice),
    image: getProductImage(product),
    badge: getProductBadge(stock),
    layout,
    switchType,
    features: [],
    caseMaterial: DEFAULT_CASE_MATERIAL,
    tags: [],
    rating: product.averageRating ?? 0,
    popularity: product._count?.wishlistItems ?? 0,
    createdAt: product.createdAt,
  };
};
