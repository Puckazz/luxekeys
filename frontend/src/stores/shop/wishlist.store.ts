'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FeaturedProduct } from '@/features/shop/types';

type WishlistState = {
  items: FeaturedProduct[];
  hydrated: boolean;
  addItem: (item: FeaturedProduct) => void;
  toggleItem: (item: FeaturedProduct) => void;
  removeItem: (slug: string) => void;
  removeItemByProductId: (productId: string) => void;
  replaceItems: (items: FeaturedProduct[]) => void;
  clear: () => void;
  setHydrated: (value: boolean) => void;
};

const isWishlistItem = (item: unknown): item is FeaturedProduct => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const candidate = item as Partial<FeaturedProduct>;

  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.variantId === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.subtitle === 'string' &&
    typeof candidate.price === 'string' &&
    typeof candidate.image === 'string'
  );
};

const dedupeWishlistItems = (items: FeaturedProduct[]): FeaturedProduct[] => {
  const itemMap = new Map<string, FeaturedProduct>();

  items.forEach((item) => {
    itemMap.set(item.productId || item.slug, item);
  });

  return Array.from(itemMap.values());
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      addItem: (item) =>
        set((state) => ({
          items: dedupeWishlistItems([item, ...state.items]),
        })),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some(
            (wishlistItem) =>
              wishlistItem.productId === item.productId ||
              wishlistItem.slug === item.slug
          );

          if (exists) {
            return {
              items: state.items.filter(
                (wishlistItem) =>
                  wishlistItem.productId !== item.productId &&
                  wishlistItem.slug !== item.slug
              ),
            };
          }

          return {
            items: dedupeWishlistItems([item, ...state.items]),
          };
        }),

      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((item) => item.slug !== slug),
        })),

      removeItemByProductId: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      replaceItems: (items) => set({ items: dedupeWishlistItems(items) }),

      clear: () => set({ items: [] }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'luxekeys-wishlist',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      migrate: (persistedState) => {
        if (
          typeof persistedState !== 'object' ||
          persistedState === null ||
          !('items' in persistedState) ||
          !Array.isArray(persistedState.items)
        ) {
          return { items: [] };
        }

        return {
          items: persistedState.items.filter(isWishlistItem),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectWishlistItems = (state: WishlistState) => state.items;

export const selectWishlistCount = (state: WishlistState) => state.items.length;
