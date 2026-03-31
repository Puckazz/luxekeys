export interface FeaturedProduct {
  name: string;
  subtitle: string;
  price: string;
  badge: string | null;
  image: string;
}

export interface CountdownItem {
  value: string;
  label: string;
}

export interface CommunityImage {
  image: string;
  alt: string;
  cols?: 1 | 2;
  rows?: 1 | 2;
}

export interface LabNote {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

export type ProductLayout = '60%' | '65%' | '75%' | 'TKL' | '100%' | 'Split';

export type ProductSwitchType = 'Linear' | 'Tactile' | 'Clicky';

export type ProductFeature =
  | 'Hotswap PCB'
  | 'RGB Lighting'
  | 'QMK/VIA Support'
  | 'Wireless'
  | 'Low Profile'
  | 'LCD Screen'
  | 'LED Matrix';

export type ProductCaseMaterial =
  | 'Aluminum'
  | 'Polycarbonate'
  | 'ABS Plastic'
  | 'Carbon Fiber';

export type ProductCardBadge = 'new' | 'in-stock' | 'limited';

export type ProductSortOption = 'popularity' | 'newest' | 'rating' | 'price';

export type ProductListViewMode = 'grid' | 'list';

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  badge?: ProductCardBadge;
  layout: ProductLayout;
  switchType: ProductSwitchType;
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial;
  tags: string[];
  rating: number;
  popularity: number;
  createdAt: string;
}

export interface ProductFilterState {
  layouts: ProductLayout[];
  switchTypes: ProductSwitchType[];
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial | 'All';
  price: {
    min: number;
    max: number;
  };
  sort: ProductSortOption;
  page: number;
  viewMode: ProductListViewMode;
}

export interface ProductPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
