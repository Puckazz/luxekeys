import type { ReactNode } from 'react';

import type {
  KeycapProfile,
  ProductCategory,
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

export type ProductBrandOptionItem = {
  id: string;
  name: string;
  slug: string;
};

export type ProductCardProps = {
  product: ProductListItem;
  viewMode: ProductListViewMode;
};

export type ProductListPageProps = {
  pageMeta: ProductCategoryPageMeta;
  defaultCategories: ProductCategory[];
  showCategoryFilter?: boolean;
  initialData?: ProductListApiResponse;
  initialQueryState: ProductListQueryState;
  initialPriceBounds: ProductPriceRange;
};

export type ProductCategoryFilterCapabilities = {
  showBrandFilter: boolean;
  showProfileFilter: boolean;
  showLayoutFilter: boolean;
  showSwitchTypeFilter: boolean;
};

export type ProductCategoryPageMetaKey = ProductCategory | 'all';

export type ProductCategoryPageMeta = {
  category: ProductCategoryPageMetaKey;
  label: string;
  heading: string;
  description: string;
};

export type ProductFiltersController = {
  showCategoryFilter: boolean;
  categoryOptions: ProductCategoryOptionItem[];
  selectedCategories: ProductCategory[];
  capabilities: ProductCategoryFilterCapabilities;
  brandOptions: ProductBrandOptionItem[];
  keycapProfileOptions: KeycapProfile[];
  layoutOptions: ProductLayout[];
  switchTypeOptions: ProductSwitchType[];
  selectedBrands: string[];
  selectedKeycapProfiles: KeycapProfile[];
  selectedLayouts: ProductLayout[];
  selectedSwitchTypes: ProductSwitchType[];
  selectedPrice: ProductPriceRange;
  priceBounds: ProductPriceRange;
  onToggleBrand: (brandSlug: string) => void;
  onToggleCategory: (category: ProductCategory) => void;
  onToggleKeycapProfile: (profile: KeycapProfile) => void;
  onToggleLayout: (layout: ProductLayout) => void;
  onToggleSwitchType: (switchType: ProductSwitchType) => void;
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
