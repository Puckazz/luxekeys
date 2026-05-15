'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { wishlistApi } from '@/features/shop/api/wishlist.api';
import { WISHLIST_QUERY_KEY } from '@/features/shop/hooks/wishlist.key';
import type { FeaturedProduct } from '@/features/shop/types';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useWishlistStore } from '@/stores/shop/wishlist.store';

const hasProductId = (item: FeaturedProduct): item is FeaturedProduct => {
  return typeof item.productId === 'string' && item.productId.length > 0;
};

export const useWishlistActions = () => {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  const items = useWishlistStore((state) => state.items);
  const addLocalItem = useWishlistStore((state) => state.addItem);
  const toggleLocalItem = useWishlistStore((state) => state.toggleItem);
  const removeLocalItem = useWishlistStore((state) => state.removeItem);
  const removeLocalItemByProductId = useWishlistStore(
    (state) => state.removeItemByProductId
  );
  const clearLocalWishlist = useWishlistStore((state) => state.clear);

  const isWished = (product: Pick<FeaturedProduct, 'productId' | 'slug'>) => {
    return items.some((item) => {
      if (product.productId && item.productId) {
        return item.productId === product.productId;
      }

      return item.slug === product.slug;
    });
  };

  const addMutation = useMutation({
    mutationFn: wishlistApi.addItem,
    onSuccess: (item) => {
      addLocalItem(item);
      queryClient.setQueryData<FeaturedProduct[]>(
        WISHLIST_QUERY_KEY,
        (previous = []) => {
          if (previous.some((entry) => entry.productId === item.productId)) {
            return previous;
          }

          return [item, ...previous];
        }
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: wishlistApi.removeItem,
    onSuccess: (_response, productId) => {
      removeLocalItemByProductId(productId);
      queryClient.setQueryData<FeaturedProduct[]>(
        WISHLIST_QUERY_KEY,
        (previous = []) =>
          previous.filter((item) => item.productId !== productId)
      );
    },
  });

  const clearMutation = useMutation({
    mutationFn: async (wishlistItems: FeaturedProduct[]) => {
      const productIds = wishlistItems
        .map((item) => item.productId)
        .filter((productId): productId is string => Boolean(productId));

      await Promise.all(
        productIds.map((productId) => wishlistApi.removeItem(productId))
      );
    },
    onSuccess: () => {
      clearLocalWishlist();
      queryClient.setQueryData<FeaturedProduct[]>(WISHLIST_QUERY_KEY, []);
    },
  });

  const toggleWishlist = (item: FeaturedProduct) => {
    if (!isAuthenticated || !hasProductId(item)) {
      toggleLocalItem(item);
      return;
    }

    if (isWished(item)) {
      removeMutation.mutate(item.productId);
      return;
    }

    addMutation.mutate(item.productId);
  };

  const removeWishlist = (item: FeaturedProduct) => {
    if (!isAuthenticated || !hasProductId(item)) {
      removeLocalItem(item.slug);
      return;
    }

    removeMutation.mutate(item.productId);
  };

  const clearWishlist = () => {
    if (!isAuthenticated) {
      clearLocalWishlist();
      return;
    }

    clearMutation.mutate(items);
  };

  return {
    items,
    isWished,
    toggleWishlist,
    removeWishlist,
    clearWishlist,
    isMutating:
      addMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  };
};
