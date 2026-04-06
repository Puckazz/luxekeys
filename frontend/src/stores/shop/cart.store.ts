'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AddCartItemInput,
  CartLineItem,
} from '@/features/shop/types/cart-page.types';

type CartState = {
  items: CartLineItem[];
  updatedAt: number;
  isDirty: boolean;
  hydrated: boolean;
  addItem: (input: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  replaceFromServer: (items: CartLineItem[], updatedAt: number) => void;
  markSynced: () => void;
  setHydrated: (value: boolean) => void;
};

const buildItemId = (slug: string, variantLabel: string) => {
  return slug + '::' + variantLabel;
};

const now = () => Date.now();

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      updatedAt: 0,
      isDirty: false,
      hydrated: false,

      addItem: (input) =>
        set((state) => {
          const normalizedQuantity = Math.max(1, input.quantity ?? 1);
          const itemId = buildItemId(input.slug, input.variantLabel);
          const existing = state.items.find((item) => item.id === itemId);

          if (existing) {
            return {
              ...state,
              items: state.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + normalizedQuantity }
                  : item
              ),
              updatedAt: now(),
              isDirty: true,
            };
          }

          return {
            ...state,
            items: [
              ...state.items,
              {
                id: itemId,
                slug: input.slug,
                name: input.name,
                variantLabel: input.variantLabel,
                unitPrice: input.unitPrice,
                quantity: normalizedQuantity,
                image: input.image,
              },
            ],
            updatedAt: now(),
            isDirty: true,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
          updatedAt: now(),
          isDirty: true,
        })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
          updatedAt: now(),
          isDirty: true,
        })),

      clear: () =>
        set((state) => ({
          ...state,
          items: [],
          updatedAt: now(),
          isDirty: true,
        })),

      replaceFromServer: (items, updatedAt) =>
        set((state) => ({
          ...state,
          items: items.map((item) => ({ ...item })),
          updatedAt,
          isDirty: false,
        })),

      markSynced: () =>
        set((state) => ({
          ...state,
          isDirty: false,
        })),

      setHydrated: (value) =>
        set((state) => ({
          ...state,
          hydrated: value,
        })),
    }),
    {
      name: 'luxekeys-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        updatedAt: state.updatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectCartItems = (state: CartState) => state.items;

export const selectCartTotalQuantity = (state: CartState) => {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const selectCartSubtotal = (state: CartState) => {
  return state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
};
