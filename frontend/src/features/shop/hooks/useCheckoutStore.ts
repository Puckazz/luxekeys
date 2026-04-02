'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CheckoutConfirmationData,
  CheckoutDraft,
  CheckoutReviewData,
} from '@/features/shop/types/checkout.types';

type CheckoutState = {
  draft: CheckoutDraft | null;
  review: CheckoutReviewData | null;
  confirmation: CheckoutConfirmationData | null;
  hydrated: boolean;
  setDraft: (draft: CheckoutDraft) => void;
  setReview: (review: CheckoutReviewData) => void;
  setConfirmation: (confirmation: CheckoutConfirmationData) => void;
  clearCheckout: () => void;
  setHydrated: (value: boolean) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      draft: null,
      review: null,
      confirmation: null,
      hydrated: false,

      setDraft: (draft) =>
        set((state) => ({
          ...state,
          draft,
        })),

      setReview: (review) =>
        set((state) => ({
          ...state,
          review,
        })),

      setConfirmation: (confirmation) =>
        set((state) => ({
          ...state,
          confirmation,
        })),

      clearCheckout: () =>
        set((state) => ({
          ...state,
          draft: null,
          review: null,
          confirmation: null,
        })),

      setHydrated: (value) =>
        set((state) => ({
          ...state,
          hydrated: value,
        })),
    }),
    {
      name: 'luxekeys-checkout',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draft: state.draft,
        review: state.review,
        confirmation: state.confirmation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
