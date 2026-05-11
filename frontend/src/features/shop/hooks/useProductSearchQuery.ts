import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/features/shop/api/products.api';

export const PRODUCT_SEARCH_QUERY_KEYS = {
  all: ['product-search'] as const,
  byQuery: (query: string) => ['product-search', query] as const,
};

const MIN_QUERY_LENGTH = 2;

export const useProductSearchQuery = (debouncedQuery: string) => {
  const trimmed = debouncedQuery.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: PRODUCT_SEARCH_QUERY_KEYS.byQuery(trimmed),
    queryFn: () => productsApi.searchProducts(trimmed),
    enabled,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
};
