'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartApi } from '@/features/shop/api/cart.api';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useCartStore } from '@/stores/shop/cart.store';

const cartQueryKey = ['cart'] as const;

export const useCartSync = () => {
  const queryClient = useQueryClient();
  const mergedOnceRef = useRef(false);

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
  const { refetch } = cartQuery;

  useEffect(() => {
    if (!isAuthenticated) {
      mergedOnceRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      void refetch();
    }
  }, [hydrated, isAuthenticated, refetch]);

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

      if (items.length === 0 && serverSnapshot.items.length > 0) {
        replaceFromServer(serverSnapshot.items, serverSnapshot.updatedAt);
        return;
      }

      if (serverSnapshot.updatedAt !== updatedAt) {
        replaceFromServer(serverSnapshot.items, serverSnapshot.updatedAt);
      }

      return;
    }

    if (items.length === 0 && serverSnapshot.items.length > 0) {
      if (mergedOnceRef.current) {
        syncMutation.mutate({ items, updatedAt });
        return;
      }

      mergedOnceRef.current = true;
      replaceFromServer(serverSnapshot.items, serverSnapshot.updatedAt);
      markSynced();
      return;
    }

    if (!mergedOnceRef.current && serverSnapshot.items.length > 0) {
      const makeKey = (item: {
        variantId: string;
        switchOptionId?: string | null;
      }) =>
        item.switchOptionId
          ? `${item.variantId}::${item.switchOptionId}`
          : item.variantId;

      const mergedMap = new Map<string, (typeof items)[number]>();

      const mergeItem = (item: (typeof items)[number]) => {
        const key = makeKey(item);
        const existing = mergedMap.get(key);

        if (existing) {
          mergedMap.set(key, {
            ...existing,
            quantity: existing.quantity + item.quantity,
          });
          return;
        }

        mergedMap.set(key, { ...item });
      };

      items.forEach(mergeItem);
      serverSnapshot.items.forEach(mergeItem);

      const mergedItems = Array.from(mergedMap.values());
      const mergedUpdatedAt = Date.now();

      mergedOnceRef.current = true;
      replaceFromServer(mergedItems, mergedUpdatedAt);
      useCartStore.setState({ isDirty: true });
      syncMutation.mutate({ items: mergedItems, updatedAt: mergedUpdatedAt });
      return;
    }

    if (items.length > 0 || serverSnapshot.items.length === 0) {
      syncMutation.mutate({ items, updatedAt });
    }
  }, [
    hydrated,
    isAuthenticated,
    cartQuery.data,
    isDirty,
    items,
    markSynced,
    replaceFromServer,
    syncMutation,
    updatedAt,
  ]);

  return {
    isSyncing: syncMutation.isPending,
    isLoadingServerCart: cartQuery.isPending,
  };
};
