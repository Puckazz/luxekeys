'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCartSync } from '@/features/shop/hooks/useCartSync';
import { queryClient } from '@/lib/queryClient';

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapBridge />
      <CartSyncBridge />
      {children}
    </QueryClientProvider>
  );
}
