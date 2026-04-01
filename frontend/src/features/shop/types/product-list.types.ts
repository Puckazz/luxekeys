import type { ReactNode } from 'react';

import type {
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductListItem,
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

export type ProductCardProps = {
  product: ProductListItem;
  viewMode: ProductListViewMode;
};

export type ProductFiltersProps = {
  layoutOptions: ProductLayout[];
  switchTypeOptions: ProductSwitchType[];
  featureOptions: ProductFeature[];
  caseMaterialOptions: ProductCaseMaterial[];
  selectedLayouts: ProductLayout[];
  selectedSwitchTypes: ProductSwitchType[];
  selectedFeatures: ProductFeature[];
  selectedCaseMaterial: ProductCaseMaterial | 'All';
  selectedPrice: ProductPriceRange;
  priceBounds: ProductPriceRange;
  onToggleLayout: (layout: ProductLayout) => void;
  onToggleSwitchType: (switchType: ProductSwitchType) => void;
  onToggleFeature: (feature: ProductFeature) => void;
  onCaseMaterialChange: (material: ProductCaseMaterial | 'All') => void;
  onPriceChange: (next: ProductPriceRange) => void;
  onReset: () => void;
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
