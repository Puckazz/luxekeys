'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AccountSidebar from '@/features/profile/components/account-sidebar/AccountSidebar';
import { RouteTopLoader } from '@/shared/components/ui/route-top-loader';
import { canAccessAdminPanel } from '@/lib/rbac';
import { useAuthStore } from '@/stores/auth/auth.store';

export default function AccountLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const sessionUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'loading') {
      return;
    }

    if (!sessionUser) {
      router.replace('/login');
      return;
    }

    if (canAccessAdminPanel(sessionUser.role)) {
      router.replace('/admin');
    }
  }, [authStatus, router, sessionUser]);

  if (
    authStatus === 'idle' ||
    authStatus === 'loading' ||
    !sessionUser ||
    canAccessAdminPanel(sessionUser.role)
  ) {
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
