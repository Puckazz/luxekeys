'use client';

import { useQuery } from '@tanstack/react-query';

import { cartApi } from '@/api/cart.api';

const cartRecommendationsQueryKey = ['cart-recommendations'] as const;

export const useCartRecommendationsQuery = () => {
  return useQuery({
    queryKey: cartRecommendationsQueryKey,
    queryFn: cartApi.getCartRecommendations,
    staleTime: 60_000,
  });
};
