import {
  KeycapProfile,
  ProductCategory,
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import {
  ProductCategoryFilterCapabilities,
  ProductCategoryPageMeta,
  ProductSortOptionItem,
} from '@/features/shop/types/product-list.types';
import { accessoriesProductsCatalogRaw } from '@/features/shop/mocks/products.accessories.data';
import { keyboardProductsCatalogRaw } from '@/features/shop/mocks/products.keyboards.data';
import { keycapsProductsCatalogRaw } from '@/features/shop/mocks/products.keycaps.data';
import { switchesProductsCatalogRaw } from '@/features/shop/mocks/products.switches.data';

const getBrandOptions = (brands: string[]): string[] => {
  return [...new Set(brands)].sort((a, b) => a.localeCompare(b));
};

export const PRODUCT_CATEGORY_SLUGS: ProductCategory[] = [
  'keyboards',
  'accessories',
  'switches',
  'keycaps',
];

export const PRODUCT_CATEGORY_PAGE_META: Record<
  ProductCategory,
  ProductCategoryPageMeta
> = {
  keyboards: {
    category: 'keyboards',
    label: 'Keyboards',
    heading: 'Mechanical Keyboards',
    description:
      'Find your perfect typing experience from our curated collection of enthusiast-grade boards.',
  },
  accessories: {
    category: 'accessories',
    label: 'Accessories',
    heading: 'Keyboard Accessories',
    description:
      'Complete your setup with premium desk mats, cables, and daily essentials built for keyboard enthusiasts.',
  },
  switches: {
    category: 'switches',
    label: 'Switches',
    heading: 'Mechanical Switches',
    description:
      'Explore linear, tactile, and clicky switch collections tuned for every typing sound and feel preference.',
  },
  keycaps: {
    category: 'keycaps',
    label: 'Keycaps',
    heading: 'Keycap Sets',
    description:
      'Discover colorways and profiles that shape both the sound and personality of your keyboard build.',
  },
};

export const PRODUCT_CATEGORY_FILTER_CAPABILITIES: Record<
  ProductCategory,
  ProductCategoryFilterCapabilities
> = {
  keyboards: {
    showBrandFilter: false,
    showProfileFilter: false,
    showLayoutFilter: true,
    showSwitchTypeFilter: true,
    showFeaturesFilter: true,
    showCaseMaterialFilter: true,
  },
  accessories: {
    showBrandFilter: true,
    showProfileFilter: false,
    showLayoutFilter: false,
    showSwitchTypeFilter: false,
    showFeaturesFilter: false,
    showCaseMaterialFilter: false,
  },
  switches: {
    showBrandFilter: true,
    showProfileFilter: false,
    showLayoutFilter: false,
    showSwitchTypeFilter: false,
    showFeaturesFilter: false,
    showCaseMaterialFilter: false,
  },
  keycaps: {
    showBrandFilter: true,
    showProfileFilter: true,
    showLayoutFilter: false,
    showSwitchTypeFilter: false,
    showFeaturesFilter: false,
    showCaseMaterialFilter: false,
  },
};

export const KEYCAP_PROFILE_OPTIONS: KeycapProfile[] = [
  'Cherry',
  'OEM',
  'SA',
  'XDA',
  'DSA',
  'KAT',
];

export const PRODUCT_BRAND_OPTIONS_BY_CATEGORY: Record<
  ProductCategory,
  string[]
> = {
  keyboards: getBrandOptions(
    keyboardProductsCatalogRaw.map((product) => product.brand)
  ),
  accessories: getBrandOptions(
    accessoriesProductsCatalogRaw.map((product) => product.brand)
  ),
  switches: getBrandOptions(
    switchesProductsCatalogRaw.map((product) => product.brand)
  ),
  keycaps: getBrandOptions(
    keycapsProductsCatalogRaw.map((product) => product.brand)
  ),
};

export const isProductCategory = (value: string): value is ProductCategory => {
  return PRODUCT_CATEGORY_SLUGS.some((category) => category === value);
};

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
