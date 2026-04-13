'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  getNextSearchParamsString,
  resetPageParam,
  setPageParam,
  setParamWithDefault,
} from '@/features/admin/hooks/query-state.utils';

type SearchParamsUpdater = (params: URLSearchParams) => void;

export const useQueryStateNavigation = (pageKey: string) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = (updater: SearchParamsUpdater) => {
    const query = getNextSearchParamsString(searchParams, updater);
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setPage = (page: number) => {
    updateSearchParams((params) => {
      setPageParam(params, pageKey, page);
    });
  };

  const setField = (key: string, value: string, defaultValue: string) => {
    updateSearchParams((params) => {
      setParamWithDefault(params, key, value, defaultValue);
      resetPageParam(params, pageKey);
    });
  };

  return {
    searchParams,
    updateSearchParams,
    setPage,
    setField,
  };
};
