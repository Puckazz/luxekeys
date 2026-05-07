import { z } from 'zod';

import {
  KEYCAP_PROFILE_OPTIONS,
  PRODUCT_CATEGORY_FILTER_CAPABILITIES,
  PRODUCT_CATEGORY_SLUGS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_VALUES,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';
import {
  KeycapProfile,
  ProductCategory,
  ProductLayout,
  ProductListQueryState,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import type { ProductCategoryFilterCapabilities } from '@/features/shop/types/product-list.types';

export const productListQueryKeys = {
  categories: 'categories',
  brands: 'brands',
  categorySlugs: 'categorySlugs',
  keycapProfiles: 'keycapProfiles',
  layouts: 'layouts',
  switchTypes: 'switchTypes',
  priceMin: 'priceMin',
  priceMax: 'priceMax',
  sort: 'sort',
  page: 'page',
} as const;

type SearchParamReader = Pick<URLSearchParams, 'get'>;

type PriceBounds = {
  min: number;
  max: number;
};

const sortSchema = z
  .enum(PRODUCT_SORT_VALUES as [ProductSortOption, ...ProductSortOption[]])
  .catch('newest');

const pageSchema = z.coerce.number().int().positive().catch(1);

const parseCsvParam = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseEnumList = <T extends string>(
  value: string | null,
  allowed: readonly T[]
): T[] => {
  const allowedSet = new Set(allowed);

  return parseCsvParam(value).filter((item): item is T => {
    return allowedSet.has(item as T);
  });
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const parseNumberParamOrDefault = (
  value: string | null,
  fallback: number
): number => {
  if (!value) {
    return fallback;
  }

  return z.coerce.number().catch(fallback).parse(value);
};

const mergeCategoryCapabilities = (
  categories: ProductCategory[]
): ProductCategoryFilterCapabilities => {
  return categories.reduce<ProductCategoryFilterCapabilities>(
    (acc, category) => {
      const next = PRODUCT_CATEGORY_FILTER_CAPABILITIES[category];

      return {
        showBrandFilter: acc.showBrandFilter || next.showBrandFilter,
        showProfileFilter: acc.showProfileFilter || next.showProfileFilter,
        showLayoutFilter: acc.showLayoutFilter || next.showLayoutFilter,
        showSwitchTypeFilter:
          acc.showSwitchTypeFilter || next.showSwitchTypeFilter,
      };
    },
    {
      showBrandFilter: false,
      showProfileFilter: false,
      showLayoutFilter: false,
      showSwitchTypeFilter: false,
    }
  );
};

export const getDefaultProductListQueryState = (
  defaultCategories: ProductCategory[],
  priceBounds: PriceBounds
): ProductListQueryState => {
  return {
    categories: defaultCategories,
    brands: [],
    categorySlugs: [],
    keycapProfiles: [],
    layouts: [],
    switchTypes: [],
    price: {
      min: priceBounds.min,
      max: priceBounds.max,
    },
    sort: 'newest',
    page: 1,
  };
};

export const parseProductListQueryState = (
  defaultCategories: ProductCategory[],
  searchParams: SearchParamReader,
  priceBounds: PriceBounds
): ProductListQueryState => {
  const defaults = getDefaultProductListQueryState(
    defaultCategories,
    priceBounds
  );

  const parsedCategories = parseEnumList(
    searchParams.get(productListQueryKeys.categories),
    PRODUCT_CATEGORY_SLUGS
  ) as ProductCategory[];
  const resolvedCategories =
    parsedCategories.length > 0 ? parsedCategories : defaults.categories;
  const capabilityCategories =
    resolvedCategories.length > 0 ? resolvedCategories : PRODUCT_CATEGORY_SLUGS;
  const capabilities = mergeCategoryCapabilities(capabilityCategories);

  const parsedMin = parseNumberParamOrDefault(
    searchParams.get(productListQueryKeys.priceMin),
    defaults.price.min
  );
  const parsedMax = parseNumberParamOrDefault(
    searchParams.get(productListQueryKeys.priceMax),
    defaults.price.max
  );

  const clampedMin = clamp(parsedMin, priceBounds.min, priceBounds.max);
  const clampedMax = clamp(parsedMax, priceBounds.min, priceBounds.max);

  const parsedBrands = parseCsvParam(
    searchParams.get(productListQueryKeys.brands)
  );

  const parsedProfiles = parseEnumList(
    searchParams.get(productListQueryKeys.keycapProfiles),
    KEYCAP_PROFILE_OPTIONS
  ) as KeycapProfile[];

  return {
    categories: resolvedCategories,
    brands: capabilities.showBrandFilter ? parsedBrands : [],
    categorySlugs: parseCsvParam(
      searchParams.get(productListQueryKeys.categorySlugs)
    ),
    keycapProfiles: capabilities.showProfileFilter ? parsedProfiles : [],
    layouts: capabilities.showLayoutFilter
      ? (parseEnumList(
          searchParams.get(productListQueryKeys.layouts),
          PRODUCT_LAYOUT_OPTIONS
        ) as ProductLayout[])
      : [],
    switchTypes: capabilities.showSwitchTypeFilter
      ? (parseEnumList(
          searchParams.get(productListQueryKeys.switchTypes),
          PRODUCT_SWITCH_TYPE_OPTIONS
        ) as ProductSwitchType[])
      : [],
    price: {
      min: Math.min(clampedMin, clampedMax),
      max: Math.max(clampedMin, clampedMax),
    },
    sort: sortSchema.parse(searchParams.get(productListQueryKeys.sort)),
    page: pageSchema.parse(searchParams.get(productListQueryKeys.page)),
  };
};
