import type {
  ProductCardBadge,
  ProductCategory,
  ProductCaseMaterial,
  ProductFeature,
  ProductGalleryImage,
  ProductLayout,
  ProductStockStatus,
  ProductSwitchType,
} from '@/features/shop/types';
import type {
  CustomerProductApiType,
  CustomerProductDetailApiItem,
  CustomerProductImageApiItem,
  CustomerProductSummaryApiItem,
  CustomerProductVariantApiItem,
} from '@/features/shop/types/product-api.types';
import {
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1400&q=80';

export const PRODUCT_TYPE_BY_CATEGORY: Record<
  ProductCategory,
  CustomerProductApiType
> = {
  keyboards: 'KEYBOARD',
  accessories: 'ACCESSORY',
  switches: 'SWITCH',
  keycaps: 'KEYCAP',
};

export const CATEGORY_BY_PRODUCT_TYPE: Record<
  CustomerProductApiType,
  ProductCategory
> = {
  KEYBOARD: 'keyboards',
  BAREBONES_KIT: 'keyboards',
  ACCESSORY: 'accessories',
  SWITCH: 'switches',
  KEYCAP: 'keycaps',
};

export const DEFAULT_LAYOUT: ProductLayout = '75%';
export const DEFAULT_SWITCH_TYPE: ProductSwitchType = 'Linear';
export const DEFAULT_CASE_MATERIAL: ProductCaseMaterial = 'ABS Plastic';

export const toNumber = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateDiscountPercentage = (
  basePrice: number,
  compareAtPrice: number
): number | undefined => {
  if (basePrice <= 0 || compareAtPrice <= basePrice) {
    return undefined;
  }

  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
};

export const isProductLayout = (
  value: string | null | undefined
): value is ProductLayout => {
  return PRODUCT_LAYOUT_OPTIONS.some((layout) => layout === value);
};

export const isProductSwitchType = (
  value: string | null | undefined
): value is ProductSwitchType => {
  return PRODUCT_SWITCH_TYPE_OPTIONS.some((switchType) => switchType === value);
};

export const isProductFeature = (value: string): value is ProductFeature => {
  return PRODUCT_FEATURE_OPTIONS.some((feature) => feature === value);
};

export const isProductCaseMaterial = (
  value: string | null | undefined
): value is ProductCaseMaterial => {
  return PRODUCT_CASE_MATERIAL_OPTIONS.some((material) => material === value);
};

export const getDefaultVariant = (
  product: CustomerProductSummaryApiItem
): CustomerProductVariantApiItem | undefined => {
  return (
    product.variants?.find((variant) => variant.isDefault) ??
    product.variants?.[0]
  );
};

export const getProductImage = (product: CustomerProductSummaryApiItem): string => {
  return (
    product.thumbnailUrl ??
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl ??
    FALLBACK_PRODUCT_IMAGE
  );
};

export const mapGalleryImages = (
  product: CustomerProductDetailApiItem
): ProductGalleryImage[] => {
  const images = product.images && product.images.length > 0 ? product.images : [];

  if (images.length === 0) {
    return [
      {
        id: `${product.id}-fallback-image`,
        src: getProductImage(product),
        alt: product.name,
      },
    ];
  }

  return images.map((image: CustomerProductImageApiItem) => ({
    id: image.id,
    src: image.imageUrl,
    alt: image.altText ?? product.name,
  }));
};

export const getStockStatus = (stock: number): ProductStockStatus => {
  if (stock <= 0) {
    return 'out-of-stock';
  }

  return stock <= 5 ? 'low-stock' : 'in-stock';
};

export const getStockLabel = (stock: number): string => {
  if (stock <= 0) {
    return 'Out of Stock';
  }

  return stock <= 5 ? 'Limited stock' : 'In Stock';
};

export const getProductBadge = (stock: number): ProductCardBadge | undefined => {
  if (stock <= 0) {
    return undefined;
  }

  return stock <= 5 ? 'limited' : 'in-stock';
};
