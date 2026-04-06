'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SavedAddress } from '@/features/profile/types';

type AddressesStoreState = {
  addresses: SavedAddress[];
  hydrated: boolean;
  setAddresses: (addresses: SavedAddress[]) => void;
  setHydrated: (value: boolean) => void;
};

export const useAddressesStore = create<AddressesStoreState>()(
  persist(
    (set) => ({
      addresses: [],
      hydrated: false,
      setAddresses: (addresses) => set(() => ({ addresses })),
      setHydrated: (value) => set(() => ({ hydrated: value })),
    }),
    {
      name: 'luxekeys-profile-addresses',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        addresses: state.addresses,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
