'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Package2, UserRound, MapPinHouse, UserCog } from 'lucide-react';

import { cn } from '@/lib/utils';
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

export default function AccountSidebar() {
  const pathname = usePathname();

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

          <AccountNavLinks pathname={pathname} />
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
              <AccountNavLinks pathname={pathname} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
