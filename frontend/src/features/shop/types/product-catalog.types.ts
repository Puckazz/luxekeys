import type {
  KeycapProfile,
  ProductCardBadge,
  ProductCaseMaterial,
  ProductCategory,
  ProductFeature,
  ProductLayout,
  ProductListItem,
  ProductSwitchType,
} from '@/features/shop/types';

type ProductCatalogBase = {
  id: string;
  slug: string;
  category?: ProductCategory;
  name: string;
  brand: string;
  description: string;
  price: number;
  discountPercentage?: number;
  image: string;
  badge?: ProductCardBadge;
  tags: string[];
  rating: number;
  popularity: number;
  createdAt: string;
};

export type KeyboardCatalogItem = ProductCatalogBase & {
  category?: 'keyboards';
  layout: ProductLayout;
  switchType: ProductSwitchType;
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial;
  keycapProfile?: never;
};

export type AccessoriesCatalogItem = ProductCatalogBase & {
  category: 'accessories';
  keycapProfile?: never;
  layout?: ProductLayout;
  switchType?: ProductSwitchType;
  features?: ProductFeature[];
  caseMaterial?: ProductCaseMaterial;
};

export type SwitchesCatalogItem = ProductCatalogBase & {
  category: 'switches';
  keycapProfile?: never;
  layout?: ProductLayout;
  switchType?: ProductSwitchType;
  features?: ProductFeature[];
  caseMaterial?: ProductCaseMaterial;
};

export type KeycapsCatalogItem = ProductCatalogBase & {
  category: 'keycaps';
  keycapProfile: KeycapProfile;
  layout?: ProductLayout;
  switchType?: ProductSwitchType;
  features?: ProductFeature[];
  caseMaterial?: ProductCaseMaterial;
};

export type ProductCatalogItem =
  | KeyboardCatalogItem
  | AccessoriesCatalogItem
  | SwitchesCatalogItem
  | KeycapsCatalogItem;

export type ProductCatalogDefaults = {
  layout: ProductLayout;
  switchType: ProductSwitchType;
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial;
};

export type ProductCatalogMapper = (
  item: ProductCatalogItem,
  defaults: ProductCatalogDefaults
) => ProductListItem;
