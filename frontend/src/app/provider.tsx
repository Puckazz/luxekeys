'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { useCartSync } from '@/features/shop/hooks/useCartSync';
import { queryClient } from '@/lib/queryClient';

function CartSyncBridge() {
  useCartSync();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartSyncBridge />
      {children}
    </QueryClientProvider>
  );
}
