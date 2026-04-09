'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CheckoutConfirmationData,
  CheckoutDraft,
} from '@/features/shop/types/checkout.types';

type CheckoutState = {
  draft: CheckoutDraft | null;
  confirmation: CheckoutConfirmationData | null;
  hydrated: boolean;
  setDraft: (draft: CheckoutDraft) => void;
  setConfirmation: (confirmation: CheckoutConfirmationData) => void;
  clearCheckout: () => void;
  setHydrated: (value: boolean) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      draft: null,
      confirmation: null,
      hydrated: false,

      setDraft: (draft) => set({ draft }),

      setConfirmation: (confirmation) => set({ confirmation }),

      clearCheckout: () =>
        set({
          draft: null,
          confirmation: null,
        }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'luxekeys-checkout',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draft: state.draft,
        confirmation: state.confirmation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
