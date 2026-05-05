import { create } from 'zustand';

import { authApi } from '@/api/auth.api';
import type { AuthResponse, AuthUser } from '@/features/auth/types';
import {
  clearAuthSession,
  getAuthSession,
  persistAuthSession,
  subscribeAuthSession,
} from '@/lib/auth-session';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  bootstrap: () => Promise<void>;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
};

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  bootstrap: async () => {
    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    bootstrapPromise = (async () => {
      const storedUser = getAuthSession();

      if (!storedUser) {
        set({ user: null, status: 'anonymous' });
        return;
      }

      set({ user: storedUser, status: 'loading' });

      try {
        const response = await authApi.refresh();
        persistAuthSession(response);
        set({ user: response.user, status: 'authenticated' });
      } catch {
        clearAuthSession();
        set({ user: null, status: 'anonymous' });
      }
    })();

    await bootstrapPromise;
    bootstrapPromise = null;
  },

  setSession: (response) => {
    persistAuthSession(response);
    set({ user: response.user, status: 'authenticated' });
  },

  clearSession: () => {
    clearAuthSession();
    set({ user: null, status: 'anonymous' });
  },
}));

export const getCurrentAuthUser = (): AuthUser | null => {
  return useAuthStore.getState().user ?? getAuthSession();
};

subscribeAuthSession((user) => {
  useAuthStore.setState({
    user,
    status: user ? 'authenticated' : 'anonymous',
  });
});
