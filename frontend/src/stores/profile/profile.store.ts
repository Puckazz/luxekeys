'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ProfileUser } from '@/features/profile/types';

type ProfileStoreState = {
  profile: ProfileUser | null;
  hydrated: boolean;
  setProfile: (profile: ProfileUser | null) => void;
  setHydrated: (value: boolean) => void;
};

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      profile: null,
      hydrated: false,
      setProfile: (profile) => set(() => ({ profile })),
      setHydrated: (value) => set(() => ({ hydrated: value })),
    }),
    {
      name: 'luxekeys-profile',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
