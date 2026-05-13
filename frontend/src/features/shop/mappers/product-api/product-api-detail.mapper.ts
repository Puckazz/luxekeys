import type { ProductDetail, ProductDetailSpec } from '@/features/shop/types';
import type { CustomerProductDetailApiItem } from '@/features/shop/types/product-api.types';

import { mapApiProductToListItem } from './product-api-list.mapper';
import {
  getDefaultVariant,
  getStockLabel,
  getStockStatus,
  isProductSwitchType,
  mapGalleryImages,
  toNumber,
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

  // Color options come from variants (one color per variant)
  const colorOptions = [
    ...new Set(
      product.variants
        ?.map((variant) => variant.color)
        .filter((color): color is string => Boolean(color)) ?? []
    ),
  ];

  // Switch types come from all switchOptions across all variants (deduplicated)
  const switchTypeSet = new Set<string>();
  product.variants?.forEach((variant) => {
    variant.switchOptions?.forEach((sw) => {
      if (isProductSwitchType(sw.switchType)) {
        switchTypeSet.add(sw.switchType);
      }
    });
  });
  const switchOptions = [...switchTypeSet];

  // Default switch option: from default variant's default switch option
  const defaultSwitchOption =
    defaultVariant?.switchOptions?.find((sw) => sw.isDefault) ??
    defaultVariant?.switchOptions?.[0];

  // Effective stock = sum of default variant's switch option stocks (or 0)
  const defaultVariantStock = defaultVariant?.switchOptions?.length
    ? defaultVariant.switchOptions.reduce((sum, sw) => sum + sw.stock, 0)
    : (defaultVariant?.stock ?? 0);

  return {
    ...listItem,
    series: product.category?.name ?? listItem.category,
    stockStatus: getStockStatus(defaultVariantStock),
    stockLabel: getStockLabel(defaultVariantStock),
    reviewCount: product._count?.reviews ?? 0,
    gallery: mapGalleryImages(product),
    switchOptions:
      switchOptions.length > 0
        ? (switchOptions as import('@/features/shop/types').ProductSwitchType[])
        : [listItem.switchType],
    colorOptions: colorOptions.length > 0 ? colorOptions : ['Default'],
    defaultSwitch:
      (defaultSwitchOption?.switchType as import('@/features/shop/types').ProductSwitchType) ??
      listItem.switchType,
    defaultSwitchName: defaultSwitchOption?.name ?? '',
    defaultColor: colorOptions[0] ?? 'Default',
    quantityLimit: Math.max(defaultVariantStock, 0),
    specsHeading: 'Technical Specifications',
    specsDescription:
      product.description ??
      product.shortDescription ??
      `${product.name} specifications and product details.`,
    technicalSpecs: mapSpecsToTechnicalSpecs(product),
    reviewsHeading: 'Community Reviews',
    reviews: [],
    variants:
      product.variants?.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price: toNumber(v.price),
        compareAtPrice: (() => {
          const compareAtPrice = toNumber(v.compareAtPrice);
          const price = toNumber(v.price);

          return compareAtPrice > price ? compareAtPrice : undefined;
        })(),
        color: v.color,
        stock: v.switchOptions?.length
          ? v.switchOptions.reduce((sum, sw) => sum + sw.stock, 0)
          : v.stock,
        switchOptions: (v.switchOptions ?? []).map((sw) => ({
          id: sw.id,
          name: sw.name,
          switchType: sw.switchType,
          price: toNumber(sw.price),
          compareAtPrice: (() => {
            const compareAtPrice = toNumber(sw.compareAtPrice);
            const price = toNumber(sw.price);

            return compareAtPrice > price ? compareAtPrice : undefined;
          })(),
          stock: sw.stock,
          isDefault: sw.isDefault,
        })),
      })) ?? [],
  };
};
