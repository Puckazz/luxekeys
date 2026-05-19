'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useProfileQuery } from '@/features/profile/hooks/useProfileQuery';
import { useAddressesQuery } from '@/features/profile/hooks/useAddressesQuery';
import { useCartSync } from '@/features/shop/hooks/useCartSync';
import { useWishlistSync } from '@/features/shop/hooks/useWishlistSync';
import { queryClient } from '@/lib/queryClient';
import { serverHealthApi } from '@/shared/api/server-health.api';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';
import { useAuthStore } from '@/stores/auth/auth.store';

const HEALTH_RETRY_DELAY_MS = 2_000;
const HEALTH_REQUEST_TIMEOUT_MS = 8_000;

type ServerReadinessStatus = 'checking' | 'ready' | 'waiting';

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

function WishlistSyncBridge() {
  useWishlistSync();
  return null;
}

function ProfileBootstrapBridge() {
  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  useProfileQuery({ enabled: isAuthenticated });
  useAddressesQuery({ enabled: isAuthenticated });

  return null;
}

function ServerReadinessGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ServerReadinessStatus>('checking');
  const [attempt, setAttempt] = useState(1);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let isActive = true;
    let retryId: number | undefined;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, HEALTH_REQUEST_TIMEOUT_MS);

    const checkServer = async () => {
      try {
        await serverHealthApi.check(controller.signal);

        if (isActive) {
          setStatus('ready');
        }
      } catch {
        if (isActive) {
          setStatus('waiting');
          retryId = window.setTimeout(() => {
            setAttempt((currentAttempt) => currentAttempt + 1);
          }, HEALTH_RETRY_DELAY_MS);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void checkServer();

    return () => {
      isActive = false;
      controller.abort();
      window.clearTimeout(timeoutId);
      window.clearTimeout(retryId);
    };
  }, [attempt, retryNonce]);

  if (status === 'ready') {
    return children;
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-16">
      <section className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          <Spinner className="size-7" />
        </div>
        <h1 className="text-foreground mt-5 text-2xl font-bold">
          Starting server
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          LuxeKeys is waking up the API. This can take a little while after the
          server has been idle.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => {
            setStatus('checking');
            setAttempt(1);
            setRetryNonce((currentNonce) => currentNonce + 1);
          }}
        >
          Retry now
        </Button>
      </section>
    </main>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerReadinessGate>
        <AuthBootstrapBridge />
        <ProfileBootstrapBridge />
        <CartSyncBridge />
        <WishlistSyncBridge />
        {children}
      </ServerReadinessGate>
    </QueryClientProvider>
  );
}
