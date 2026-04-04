'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  ProductCaseMaterial,
  ProductFeature,
  ProductLayout,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';
import {
  parseProductListQueryState,
  productListQueryKeys,
} from '@/features/shop/utils/product-list-query.utils';
import {
  PRODUCT_CASE_MATERIAL_OPTIONS,
  PRODUCT_FEATURE_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SWITCH_TYPE_OPTIONS,
} from '@/features/shop/utils/product-list-options.utils';

type PriceRange = {
  min: number;
  max: number;
};

type UseProductListQueryStateOptions = {
  priceBounds: PriceRange;
};

const serializeList = (items: string[]): string => {
  return items.join(',');
};

const toggleListItem = <T extends string>(items: T[], value: T): T[] => {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
};

export const useProductListQueryState = ({
  priceBounds,
}: UseProductListQueryStateOptions) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState = useMemo(() => {
    return parseProductListQueryState(searchParams, priceBounds);
  }, [searchParams, priceBounds]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setPage = (page: number) => {
    updateSearchParams((params) => {
      if (page <= 1) {
        params.delete(productListQueryKeys.page);
      } else {
        params.set(productListQueryKeys.page, String(page));
      }
    });
  };

  const resetPage = (params: URLSearchParams) => {
    params.delete(productListQueryKeys.page);
  };

  const setSort = (sort: ProductSortOption) => {
    updateSearchParams((params) => {
      params.set(productListQueryKeys.sort, sort);
      resetPage(params);
    });
  };

  const setCaseMaterial = (caseMaterial: ProductCaseMaterial | 'All') => {
    updateSearchParams((params) => {
      if (caseMaterial === 'All') {
        params.delete(productListQueryKeys.caseMaterial);
      } else {
        params.set(productListQueryKeys.caseMaterial, caseMaterial);
      }
      resetPage(params);
    });
  };

  const setPriceRange = (min: number, max: number) => {
    updateSearchParams((params) => {
      params.set(productListQueryKeys.priceMin, String(min));
      params.set(productListQueryKeys.priceMax, String(max));
      resetPage(params);
    });
  };

  const toggleLayouts = (layout: ProductLayout) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.layouts, layout);
      if (next.length === 0) {
        params.delete(productListQueryKeys.layouts);
      } else {
        params.set(productListQueryKeys.layouts, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleSwitchTypes = (switchType: ProductSwitchType) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.switchTypes, switchType);
      if (next.length === 0) {
        params.delete(productListQueryKeys.switchTypes);
      } else {
        params.set(productListQueryKeys.switchTypes, serializeList(next));
      }
      resetPage(params);
    });
  };

  const toggleFeatures = (feature: ProductFeature) => {
    updateSearchParams((params) => {
      const next = toggleListItem(queryState.features, feature);
      if (next.length === 0) {
        params.delete(productListQueryKeys.features);
      } else {
        params.set(productListQueryKeys.features, serializeList(next));
      }
      resetPage(params);
    });
  };

  const resetFilters = () => {
    updateSearchParams((params) => {
      params.delete(productListQueryKeys.layouts);
      params.delete(productListQueryKeys.switchTypes);
      params.delete(productListQueryKeys.features);
      params.delete(productListQueryKeys.caseMaterial);
      params.delete(productListQueryKeys.priceMin);
      params.delete(productListQueryKeys.priceMax);
      params.delete(productListQueryKeys.sort);
      params.delete(productListQueryKeys.page);
    });
  };

  return {
    queryState,
    filterOptions: {
      layoutOptions: PRODUCT_LAYOUT_OPTIONS,
      switchTypeOptions: PRODUCT_SWITCH_TYPE_OPTIONS,
      featureOptions: PRODUCT_FEATURE_OPTIONS,
      caseMaterialOptions: PRODUCT_CASE_MATERIAL_OPTIONS,
    },
    sortOptions: PRODUCT_SORT_OPTIONS,
    setPage,
    setSort,
    setCaseMaterial,
    setPriceRange,
    toggleLayouts,
    toggleSwitchTypes,
    toggleFeatures,
    resetFilters,
  };
};
