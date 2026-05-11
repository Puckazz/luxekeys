'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useProfileQuery } from '@/features/profile/hooks/useProfileQuery';
import { useAddressesQuery } from '@/features/profile/hooks/useAddressesQuery';
import { useCartSync } from '@/features/shop/hooks/useCartSync';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth/auth.store';

function AuthBootstrapBridge() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return null;
}

function CartSyncBridge() {
  useCartSync();
  return null;
}

function ProfileBootstrapBridge() {
  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  useProfileQuery({ enabled: isAuthenticated });
  useAddressesQuery({ enabled: isAuthenticated });

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapBridge />
      <ProfileBootstrapBridge />
      <CartSyncBridge />
      {children}
    </QueryClientProvider>
  );
}
