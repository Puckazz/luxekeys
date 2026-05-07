import type { ProductDetail, ProductDetailSpec } from '@/features/shop/types';
import type { CustomerProductDetailApiItem } from '@/features/shop/types/product-api.types';

import { mapApiProductToListItem } from './product-api-list.mapper';
import {
  getDefaultVariant,
  getStockLabel,
  getStockStatus,
  isProductSwitchType,
  mapGalleryImages,
} from './product-api.shared';

const mapSpecsToTechnicalSpecs = (
  product: CustomerProductDetailApiItem
): ProductDetailSpec[] => {
  return (
    product.specs?.map((spec) => ({
      id: spec.id,
      title: spec.specKey,
      description: spec.specValue,
      bullets: spec.groupName ? [spec.groupName] : [],
    })) ?? []
  );
};

export const mapApiProductToDetail = (
  product: CustomerProductDetailApiItem
): ProductDetail => {
  const listItem = mapApiProductToListItem(product);
  const defaultVariant = getDefaultVariant(product);
  const stock = defaultVariant?.stock ?? 0;
  const colorOptions = [
    ...new Set(
      product.variants
        ?.map((variant) => variant.color)
        .filter((color): color is string => Boolean(color)) ?? []
    ),
  ];
  const switchOptions = [
    ...new Set(
      product.variants
        ?.map((variant) => variant.switchType)
        .filter(isProductSwitchType) ?? []
    ),
  ];

  return {
    ...listItem,
    series: product.category?.name ?? listItem.category,
    stockStatus: getStockStatus(stock),
    stockLabel: getStockLabel(stock),
    reviewCount: product._count?.reviews ?? 0,
    gallery: mapGalleryImages(product),
    switchOptions:
      switchOptions.length > 0 ? switchOptions : [listItem.switchType],
    colorOptions: colorOptions.length > 0 ? colorOptions : ['Default'],
    defaultSwitch: listItem.switchType,
    defaultColor: colorOptions[0] ?? 'Default',
    quantityLimit: Math.max(stock, 0),
    specsHeading: 'Technical Specifications',
    specsDescription:
      product.description ??
      product.shortDescription ??
      `${product.name} specifications and product details.`,
    technicalSpecs: mapSpecsToTechnicalSpecs(product),
    reviewsHeading: 'Community Reviews',
    reviews: [],
  };
};
