'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import AccountSidebar from '@/features/profile/components/account-sidebar/AccountSidebar';
import { RouteTopLoader } from '@/shared/components/ui/route-top-loader';
import { useAuthStore } from '@/stores/auth/auth.store';

export default function AccountLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'loading') {
      return;
    }

    if (!sessionUser) {
      const params = new URLSearchParams({ next: currentPath });
      router.replace(`/login?${params.toString()}`);
    }
  }, [authStatus, currentPath, router, sessionUser]);

  if (authStatus === 'idle' || authStatus === 'loading' || !sessionUser) {
    return <RouteTopLoader />;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <AccountSidebar />

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
