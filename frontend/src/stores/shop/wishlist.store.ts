'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FeaturedProduct } from '@/features/shop/types';

type WishlistState = {
  items: FeaturedProduct[];
  hydrated: boolean;
  toggleItem: (item: FeaturedProduct) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  setHydrated: (value: boolean) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some(
            (wishlistItem) => wishlistItem.slug === item.slug
          );

          if (exists) {
            return {
              items: state.items.filter(
                (wishlistItem) => wishlistItem.slug !== item.slug
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((item) => item.slug !== slug),
        })),

      clear: () => set({ items: [] }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'luxekeys-wishlist',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectWishlistItems = (state: WishlistState) => state.items;

export const selectWishlistCount = (state: WishlistState) => state.items.length;
