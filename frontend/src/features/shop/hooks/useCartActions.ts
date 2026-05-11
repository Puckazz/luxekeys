'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartApi } from '@/features/shop/api/cart.api';
import type {
  AddCartItemInput,
  CartLineItem,
} from '@/features/shop/types/cart-page.types';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useCartStore } from '@/stores/shop/cart.store';

const cartQueryKey = ['cart'] as const;

type UpdateCartItemInput = {
  item: CartLineItem;
  quantity: number;
};

export const useCartActions = () => {
  const queryClient = useQueryClient();

  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  const addLocalItem = useCartStore((state) => state.addItem);
  const localItems = useCartStore((state) => state.items);
  const removeLocalItem = useCartStore((state) => state.removeItem);
  const setLocalQuantity = useCartStore((state) => state.setQuantity);
  const resetCart = useCartStore((state) => state.reset);
  const replaceFromServer = useCartStore((state) => state.replaceFromServer);
  const markSynced = useCartStore((state) => state.markSynced);

  const applyServerSnapshot = (snapshot: {
    items: CartLineItem[];
    updatedAt: number;
  }) => {
    const snapshotById = new Map(snapshot.items.map((item) => [item.id, item]));
    const localIdSet = new Set(localItems.map((item) => item.id));
    const orderedItems = localItems
      .map((item) => snapshotById.get(item.id))
      .filter((item): item is CartLineItem => Boolean(item));
    const newItems = snapshot.items.filter((item) => !localIdSet.has(item.id));
    const nextItems = [...orderedItems, ...newItems];

    replaceFromServer(nextItems, snapshot.updatedAt);
    markSynced();
    queryClient.setQueryData(cartQueryKey, {
      ...snapshot,
      items: nextItems,
    });
  };

  const addItemMutation = useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: applyServerSnapshot,
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ item, quantity }: UpdateCartItemInput) => {
      if (!item.cartItemId) {
        throw new Error('Missing cart item id for update.');
      }

      return cartApi.updateItem(item.cartItemId, quantity);
    },
    onSuccess: applyServerSnapshot,
  });

  const removeItemMutation = useMutation({
    mutationFn: (item: CartLineItem) => {
      if (!item.cartItemId) {
        throw new Error('Missing cart item id for removal.');
      }

      return cartApi.removeItem(item.cartItemId);
    },
    onSuccess: applyServerSnapshot,
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      resetCart();
      queryClient.setQueryData(cartQueryKey, {
        items: [],
        updatedAt: Date.now(),
      });
    },
  });

  const addItem = (input: AddCartItemInput) => {
    if (!isAuthenticated) {
      addLocalItem(input);
      return;
    }

    addItemMutation.mutate(input);
  };

  const updateQuantity = (item: CartLineItem, quantity: number) => {
    if (quantity <= 0) {
      removeItem(item);
      return;
    }

    if (!isAuthenticated || !item.cartItemId) {
      setLocalQuantity(item.id, quantity);
      return;
    }

    updateItemMutation.mutate({ item, quantity });
  };

  const removeItem = (item: CartLineItem) => {
    if (!isAuthenticated || !item.cartItemId) {
      removeLocalItem(item.id);
      return;
    }

    removeItemMutation.mutate(item);
  };

  const clearCart = () => {
    if (!isAuthenticated) {
      resetCart();
      return;
    }

    clearCartMutation.mutate();
  };

  return {
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};
