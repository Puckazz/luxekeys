import type { ReactNode } from 'react';

import type {
  KeycapProfile,
  ProductCategory,
  ProductCaseMaterial,
  ProductFeature,
  ProductListApiResponse,
  ProductLayout,
  ProductListItem,
  ProductListQueryState,
  ProductListViewMode,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';

export type ProductPriceRange = {
  min: number;
  max: number;
};

export type ProductSortOptionItem = {
  value: ProductSortOption;
  label: string;
};

export type ProductCategoryOptionItem = {
  value: ProductCategory;
  label: string;
};

export type ProductCardProps = {
  product: ProductListItem;
  viewMode: ProductListViewMode;
};

export type ProductListPageProps = {
  category: ProductCategory;
  initialData: ProductListApiResponse;
  initialQueryState: ProductListQueryState;
  initialPriceBounds: ProductPriceRange;
};

export type ProductCategoryFilterCapabilities = {
  showBrandFilter: boolean;
  showProfileFilter: boolean;
  showLayoutFilter: boolean;
  showSwitchTypeFilter: boolean;
  showFeaturesFilter: boolean;
  showCaseMaterialFilter: boolean;
};

export type ProductCategoryPageMeta = {
  category: ProductCategory;
  label: string;
  heading: string;
  description: string;
};

export type ProductFiltersController = {
  categoryOptions: ProductCategoryOptionItem[];
  selectedCategory: ProductCategory;
  capabilities: ProductCategoryFilterCapabilities;
  brandOptions: string[];
  keycapProfileOptions: KeycapProfile[];
  layoutOptions: ProductLayout[];
  switchTypeOptions: ProductSwitchType[];
  featureOptions: ProductFeature[];
  caseMaterialOptions: ProductCaseMaterial[];
  selectedBrands: string[];
  selectedKeycapProfiles: KeycapProfile[];
  selectedLayouts: ProductLayout[];
  selectedSwitchTypes: ProductSwitchType[];
  selectedFeatures: ProductFeature[];
  selectedCaseMaterial: ProductCaseMaterial | 'All';
  selectedPrice: ProductPriceRange;
  priceBounds: ProductPriceRange;
  onToggleBrand: (brand: string) => void;
  onCategoryChange: (category: ProductCategory) => void;
  onToggleKeycapProfile: (profile: KeycapProfile) => void;
  onToggleLayout: (layout: ProductLayout) => void;
  onToggleSwitchType: (switchType: ProductSwitchType) => void;
  onToggleFeature: (feature: ProductFeature) => void;
  onCaseMaterialChange: (material: ProductCaseMaterial | 'All') => void;
  onPriceChange: (next: ProductPriceRange) => void;
  onReset: () => void;
};

export type ProductFiltersProps = {
  className?: string;
};

export type ProductToolbarProps = {
  totalItems: number;
  viewMode: ProductListViewMode;
  sort: ProductSortOption;
  sortOptions: ProductSortOptionItem[];
  onViewModeChange: (mode: ProductListViewMode) => void;
  onSortChange: (sort: ProductSortOption) => void;
  onOpenFilters: () => void;
};

export type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type MobileProductFiltersDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};
