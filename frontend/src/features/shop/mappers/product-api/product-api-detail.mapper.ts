import type { ProductDetail, ProductDetailSpec, ProductFeature } from '@/features/shop/types';
import type { CustomerProductDetailApiItem } from '@/features/shop/types/product-api.types';

import { mapApiProductToListItem } from './product-api-list.mapper';
import {
  DEFAULT_CASE_MATERIAL,
  getDefaultVariant,
  getStockLabel,
  getStockStatus,
  isProductCaseMaterial,
  isProductFeature,
  isProductSwitchType,
  mapGalleryImages,
} from './product-api.shared';

const mapSpecsToFeatures = (
  product: CustomerProductDetailApiItem
): ProductFeature[] => {
  const values =
    product.specs?.flatMap((spec) => [spec.specKey, spec.specValue]) ?? [];

  return values.filter((value): value is ProductFeature =>
    isProductFeature(value)
  );
};

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

const getCaseMaterial = (product: CustomerProductDetailApiItem) => {
  const materialSpec = product.specs?.find((spec) => {
    return spec.specKey.toLowerCase().includes('material');
  });

  return isProductCaseMaterial(materialSpec?.specValue)
    ? materialSpec.specValue
    : DEFAULT_CASE_MATERIAL;
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
    features: mapSpecsToFeatures(product),
    caseMaterial: getCaseMaterial(product),
    series: product.category?.name ?? listItem.category,
    stockStatus: getStockStatus(stock),
    stockLabel: getStockLabel(stock),
    reviewCount: product._count?.reviews ?? 0,
    gallery: mapGalleryImages(product),
    switchOptions: switchOptions.length > 0 ? switchOptions : [listItem.switchType],
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
