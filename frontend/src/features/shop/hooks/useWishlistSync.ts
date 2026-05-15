'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { wishlistApi } from '@/features/shop/api/wishlist.api';
import { WISHLIST_QUERY_KEY } from '@/features/shop/hooks/wishlist.key';
import type { FeaturedProduct } from '@/features/shop/types';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useWishlistStore } from '@/stores/shop/wishlist.store';

export const useWishlistSync = () => {
  const queryClient = useQueryClient();
  const wasAuthenticatedRef = useRef(false);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  const authStatus = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const isAuthenticated = authStatus === 'authenticated';

  const hydrated = useWishlistStore((state) => state.hydrated);
  const items = useWishlistStore((state) => state.items);
  const replaceItems = useWishlistStore((state) => state.replaceItems);
  const clearWishlist = useWishlistStore((state) => state.clear);

  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: wishlistApi.getWishlist,
    enabled: hydrated && isAuthenticated && syncedUserId === userId,
    staleTime: 30_000,
  });

  const { mutate: mergeWishlist, isPending: isMergingWishlist } = useMutation({
    mutationFn: async (localItems: FeaturedProduct[]) => {
      const productIds = [
        ...new Set(
          localItems
            .map((item) => item.productId)
            .filter((productId): productId is string => Boolean(productId))
        ),
      ];

      await Promise.all(
        productIds.map((productId) => wishlistApi.addItem(productId))
      );

      return wishlistApi.getWishlist();
    },
    onSuccess: (serverItems) => {
      replaceItems(serverItems);
      queryClient.setQueryData(WISHLIST_QUERY_KEY, serverItems);
      setSyncedUserId(userId);
    },
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setSyncedUserId(null);
      queryClient.removeQueries({ queryKey: WISHLIST_QUERY_KEY });

      if (wasAuthenticatedRef.current) {
        clearWishlist();
      }

      wasAuthenticatedRef.current = false;
      return;
    }

    wasAuthenticatedRef.current = true;

    if (syncedUserId !== userId && !isMergingWishlist) {
      mergeWishlist(items);
    }
  }, [
    clearWishlist,
    hydrated,
    isAuthenticated,
    isMergingWishlist,
    items,
    mergeWishlist,
    queryClient,
    syncedUserId,
    userId,
  ]);

  useEffect(() => {
    if (wishlistQuery.data && syncedUserId === userId) {
      replaceItems(wishlistQuery.data);
    }
  }, [replaceItems, syncedUserId, userId, wishlistQuery.data]);

  return {
    isLoadingWishlist: wishlistQuery.isPending || isMergingWishlist,
  };
};
