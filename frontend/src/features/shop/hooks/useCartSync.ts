'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartApi } from '@/features/shop/api/cart.api';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useCartStore } from '@/stores/shop/cart.store';

const cartQueryKey = ['cart'] as const;

export const useCartSync = () => {
  const queryClient = useQueryClient();

  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const updatedAt = useCartStore((state) => state.updatedAt);
  const isDirty = useCartStore((state) => state.isDirty);
  const replaceFromServer = useCartStore((state) => state.replaceFromServer);
  const markSynced = useCartStore((state) => state.markSynced);

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: cartApi.getCart,
    enabled: hydrated && isAuthenticated,
    staleTime: 30_000,
  });

  const syncMutation = useMutation({
    mutationFn: cartApi.syncCart,
    onSuccess: (serverSnapshot) => {
      replaceFromServer(serverSnapshot.items, serverSnapshot.updatedAt);
      markSynced();
      queryClient.setQueryData(cartQueryKey, serverSnapshot);
    },
  });

  useEffect(() => {
    if (
      !hydrated ||
      !isAuthenticated ||
      !cartQuery.data ||
      syncMutation.isPending
    ) {
      return;
    }

    const serverSnapshot = cartQuery.data;

    if (!isDirty) {
      if (updatedAt > serverSnapshot.updatedAt && items.length > 0) {
        syncMutation.mutate({ items, updatedAt });
        return;
      }

      if (serverSnapshot.updatedAt !== updatedAt) {
        replaceFromServer(serverSnapshot.items, serverSnapshot.updatedAt);
      }

      return;
    }

    if (items.length === 0) {
      syncMutation.mutate({ items, updatedAt });
      return;
    }

    let hasMerged = false;
    const mergedItems = [...items];

    for (const serverItem of serverSnapshot.items) {
      const existsLocally = mergedItems.some(
        (localItem) =>
          localItem.variantId === serverItem.variantId &&
          localItem.switchOptionId === serverItem.switchOptionId
      );

      if (!existsLocally) {
        mergedItems.push(serverItem);
        hasMerged = true;
      }
    }

    if (hasMerged) {
      replaceFromServer(mergedItems, Date.now());
      useCartStore.setState({ isDirty: true });
      return;
    }

    syncMutation.mutate({ items, updatedAt });
  }, [
    hydrated,
    isAuthenticated,
    cartQuery.data,
    isDirty,
    items,
    replaceFromServer,
    syncMutation,
    updatedAt,
  ]);

  return {
    isSyncing: syncMutation.isPending,
    isLoadingServerCart: cartQuery.isPending,
  };
};
