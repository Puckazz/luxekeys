import {
  KeycapProfile,
  ProductCategory,
  ProductLayout,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import {
  ProductCategoryFilterCapabilities,
  ProductCategoryPageMeta,
  ProductCategoryPageMetaKey,
  ProductSortOptionItem,
} from '@/features/shop/types/product-list.types';

export const PRODUCT_CATEGORY_SLUGS: ProductCategory[] = [
  'keyboards',
  'accessories',
  'switches',
  'keycaps',
];

export const PRODUCT_CATEGORY_PAGE_META: Record<
  ProductCategoryPageMetaKey,
  ProductCategoryPageMeta
> = {
  all: {
    category: 'all',
    label: 'All Products',
    heading: 'Shop All Products',
    description:
      'Browse every keyboard, switch, keycap, and accessory in one place.',
  },
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
    showBrandFilter: true,
    showProfileFilter: false,
    showLayoutFilter: true,
    showSwitchTypeFilter: true,
  },
  accessories: {
    showBrandFilter: true,
    showProfileFilter: false,
    showLayoutFilter: false,
    showSwitchTypeFilter: false,
  },
  switches: {
    showBrandFilter: true,
    showProfileFilter: false,
    showLayoutFilter: false,
    showSwitchTypeFilter: true,
  },
  keycaps: {
    showBrandFilter: true,
    showProfileFilter: true,
    showLayoutFilter: false,
    showSwitchTypeFilter: false,
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

export const PRODUCT_SORT_OPTIONS: ProductSortOptionItem[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export const PRODUCT_SORT_VALUES: ProductSortOption[] =
  PRODUCT_SORT_OPTIONS.map((option) => option.value);
