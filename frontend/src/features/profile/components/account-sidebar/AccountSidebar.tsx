'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  Menu,
  Package2,
  UserRound,
  MapPinHouse,
  UserCog,
} from 'lucide-react';
import { useState } from 'react';

import { authApi } from '@/features/auth/api/auth.api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth/auth.store';
import type { AccountNavItem } from '@/features/profile/types';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';

const accountNavItems: AccountNavItem[] = [
  {
    href: '/account',
    label: 'Personal Info',
    icon: UserRound,
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: MapPinHouse,
  },
  {
    href: '/account/orders',
    label: 'Order History',
    icon: Package2,
  },
];

const getIsActive = (pathname: string, href: string) => {
  return pathname === href;
};

const AccountNavLinks = ({
  pathname,
  onSelect,
}: {
  pathname: string;
  onSelect?: () => void;
}) => {
  return (
    <nav aria-label="Account navigation" className="space-y-1.5">
      {accountNavItems.map((item) => {
        const isActive = getIsActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onSelect}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive
                ? 'border-primary/45 bg-primary/10 text-primary'
                : 'border-border/70 bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

const AccountLogoutButton = ({
  isLoggingOut,
  onLogout,
}: {
  isLoggingOut: boolean;
  onLogout: () => void;
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-2"
      disabled={isLoggingOut}
      onClick={onLogout}
    >
      <LogOut className="size-4" />
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </Button>
  );
};

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
    } finally {
      router.replace('/login');
      clearSession();
    }
  };

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="border-border/70 bg-card/30 sticky top-22 rounded-2xl border p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="bg-primary/15 text-primary inline-flex size-8 items-center justify-center rounded-lg">
              <UserCog className="size-4" />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold">
                My Account
              </p>
              <p className="text-muted-foreground text-xs">Profile settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <AccountNavLinks pathname={pathname} />
            <div className="border-border/70 border-t pt-4">
              <AccountLogoutButton
                isLoggingOut={isLoggingOut}
                onLogout={() => {
                  void handleLogout();
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Menu className="size-4" />
              Account Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[86%] max-w-sm">
            <SheetHeader>
              <SheetTitle>My Account</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <AccountNavLinks pathname={pathname} />
                <div className="border-border/70 border-t pt-4">
                  <AccountLogoutButton
                    isLoggingOut={isLoggingOut}
                    onLogout={() => {
                      void handleLogout();
                    }}
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
