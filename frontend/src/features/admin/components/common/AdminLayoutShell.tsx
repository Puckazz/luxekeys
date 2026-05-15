'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Boxes,
  Activity,
  ChevronUp,
  ClipboardList,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Package,
  PackageSearch,
  ShieldAlert,
  Tag,
  Tags,
  Users,
  User,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { authApi } from '@/features/auth/api/auth.api';
import { canAccessAdminPanel } from '@/lib/rbac';
import { useAuthStore } from '@/stores/auth/auth.store';
import { RouteTopLoader } from '@/shared/components/ui/route-top-loader';
import { AppErrorState } from '@/shared/components/layout/AppErrorState';

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutGrid,
    activeIncludes: ['/admin'],
    exact: true,
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: Package,
    activeIncludes: ['/admin/products'],
  },
  {
    href: '/admin/inventory',
    label: 'Inventory',
    icon: PackageSearch,
    activeIncludes: ['/admin/inventory'],
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: Tag,
    activeIncludes: ['/admin/categories'],
  },
  {
    href: '/admin/brands',
    label: 'Brands',
    icon: Tags,
    activeIncludes: ['/admin/brands'],
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ClipboardList,
    activeIncludes: ['/admin/orders'],
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    activeIncludes: ['/admin/users'],
  },
  {
    href: '/admin/reviews',
    label: 'Reviews',
    icon: MessageSquare,
    activeIncludes: ['/admin/reviews'],
  },
  {
    href: '/admin/health',
    label: 'Health',
    icon: Activity,
    activeIncludes: ['/admin/health'],
  },
] as const;

const isActiveItem = (
  pathname: string,
  item: (typeof navItems)[number]
): boolean => {
  if ('exact' in item && item.exact) {
    return pathname === item.href;
  }

  return item.activeIncludes.some((activePath) =>
    pathname.startsWith(activePath)
  );
};

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <SidebarProvider>
      <AdminLayoutShellContent>{children}</AdminLayoutShellContent>
    </SidebarProvider>
  );
}

function AdminLayoutShellContent({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setMobileOpen } = useSidebar();
  const sessionUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const canAccessAdmin = canAccessAdminPanel(sessionUser?.role);
  const displayName = sessionUser?.name ?? 'Admin Keys';
  const displayEmail = sessionUser?.email ?? 'admin@luxekeys.io';
  const displayInitials =
    displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AK';

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
    } finally {
      clearSession();
      router.replace('/login');
    }
  };

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile, pathname, setMobileOpen]);

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'loading') {
      return;
    }

    if (!sessionUser && !isLoggingOut) {
      const params = new URLSearchParams({ next: pathname });
      router.replace(`/login?${params.toString()}`);
      return;
    }
  }, [authStatus, isLoggingOut, pathname, router, sessionUser]);

  if (
    authStatus === 'idle' ||
    authStatus === 'loading' ||
    isLoggingOut ||
    !sessionUser
  ) {
    return <RouteTopLoader />;
  }

  if (!canAccessAdmin) {
    return (
      <AppErrorState
        code="403"
        title="Access denied"
        description="You do not have permission to access the admin console."
        icon={ShieldAlert}
        tone="destructive"
      />
    );
  }

  return (
    <section className="w-full">
      <div className="flex min-h-screen items-start gap-0">
        <Sidebar className="bg-card/35 sticky top-0 h-screen rounded-none border-y-0 border-l-0 border-border/70">
          <SidebarHeader className='border-border/70'>
            <div className="flex items-center gap-2 px-1">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <Boxes className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">LuxeKeys Admin</p>
                <p className="text-sidebar-foreground/70 text-xs">
                  Catalog Console
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = isActiveItem(pathname, item);
                const ItemIcon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="rounded-[14px] border-0"
                    >
                      <Link href={item.href}>
                        <ItemIcon className="size-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className='border-border/70'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="bg-card/45 border-border/70 hover:bg-card/70 flex w-full items-center gap-2 rounded-md border p-3 text-left transition-colors"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                    {displayInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    <p className="text-sidebar-foreground/70 truncate text-xs">
                      {displayEmail}
                    </p>
                  </div>
                  <ChevronUp className="text-sidebar-foreground/70 size-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="end"
                className="w-64 rounded-md"
              >
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-xs font-semibold">
                      {displayInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className='hover:bg-card/70! h-10'>
                  <Link href="/admin/profile">
                    <User className="size-4" />
                    Admin Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    void handleLogout();
                  }}
                  className='hover:bg-card/70! h-10'
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-3 lg:hidden">
              <SidebarTrigger />
            </div>

            <main>{children}</main>
          </div>
        </SidebarInset>
      </div>
    </section>
  );
}
