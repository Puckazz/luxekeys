import { z } from 'zod';

import {
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_VALUES,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';
import {
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductListQueryState,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';

export const productListQueryKeys = {
  layouts: 'layouts',
  switchTypes: 'switchTypes',
  features: 'features',
  caseMaterial: 'caseMaterial',
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
  .catch('popularity');

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

export const getDefaultProductListQueryState = (
  priceBounds: PriceBounds
): ProductListQueryState => {
  return {
    layouts: [],
    switchTypes: [],
    features: [],
    caseMaterial: 'All',
    price: {
      min: priceBounds.min,
      max: priceBounds.max,
    },
    sort: 'popularity',
    page: 1,
  };
};

export const parseProductListQueryState = (
  searchParams: SearchParamReader,
  priceBounds: PriceBounds
): ProductListQueryState => {
  const defaults = getDefaultProductListQueryState(priceBounds);

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

  const rawCaseMaterial = searchParams.get(productListQueryKeys.caseMaterial);
  const caseMaterialOptions = new Set(PRODUCT_CASE_MATERIAL_OPTIONS);
  const caseMaterial: ProductCaseMaterial | 'All' =
    rawCaseMaterial &&
    caseMaterialOptions.has(rawCaseMaterial as ProductCaseMaterial)
      ? (rawCaseMaterial as ProductCaseMaterial)
      : 'All';

  return {
    layouts: parseEnumList(
      searchParams.get(productListQueryKeys.layouts),
      PRODUCT_LAYOUT_OPTIONS
    ) as ProductLayout[],
    switchTypes: parseEnumList(
      searchParams.get(productListQueryKeys.switchTypes),
      PRODUCT_SWITCH_TYPE_OPTIONS
    ) as ProductSwitchType[],
    features: parseEnumList(
      searchParams.get(productListQueryKeys.features),
      PRODUCT_FEATURE_OPTIONS
    ) as ProductFeature[],
    caseMaterial,
    price: {
      min: Math.min(clampedMin, clampedMax),
      max: Math.max(clampedMin, clampedMax),
    },
    sort: sortSchema.parse(searchParams.get(productListQueryKeys.sort)),
    page: pageSchema.parse(searchParams.get(productListQueryKeys.page)),
  };
};
