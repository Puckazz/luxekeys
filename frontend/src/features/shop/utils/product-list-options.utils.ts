import {
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import { ProductSortOptionItem } from '@/features/shop/types/product-list.types';

export const PRODUCT_LAYOUT_OPTIONS: ProductLayout[] = [
  '60%',
  '65%',
  '75%',
  'TKL',
  '100%',
  'Split',
];

export const PRODUCT_SWITCH_TYPE_OPTIONS: ProductSwitchType[] = [
  'Linear',
  'Tactile',
  'Clicky',
];

export const PRODUCT_FEATURE_OPTIONS: ProductFeature[] = [
  'Hotswap PCB',
  'RGB Lighting',
  'QMK/VIA Support',
  'Wireless',
  'Low Profile',
  'LCD Screen',
];

export const PRODUCT_CASE_MATERIAL_OPTIONS: ProductCaseMaterial[] = [
  'Aluminum',
  'Polycarbonate',
  'ABS Plastic',
  'Carbon Fiber',
];

export const PRODUCT_SORT_OPTIONS: ProductSortOptionItem[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price', label: 'Price: Low to High' },
];

export const PRODUCT_SORT_VALUES: ProductSortOption[] =
  PRODUCT_SORT_OPTIONS.map((option) => option.value);
