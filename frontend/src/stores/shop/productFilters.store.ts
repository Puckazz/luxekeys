'use client';

import { create } from 'zustand';

import type { ProductFiltersController } from '@/features/shop/types/product-list.types';

type ProductFiltersStore = {
  controller: ProductFiltersController | null;
  setController: (controller: ProductFiltersController) => void;
  clearController: () => void;
};

export const useProductFiltersStore = create<ProductFiltersStore>()((set) => ({
  controller: null,
  setController: (controller) =>
    set((state) => ({
      ...state,
      controller,
    })),
  clearController: () =>
    set((state) => ({
      ...state,
      controller: null,
    })),
}));
