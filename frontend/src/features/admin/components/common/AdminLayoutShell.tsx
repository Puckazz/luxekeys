'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  ChevronUp,
  LayoutGrid,
  LogOut,
  Package,
  PackageSearch,
  Tag,
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
} from '@/shared/components/ui/sidebar';

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
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider>
      <section className="w-full">
        <div className="flex min-h-screen items-start gap-0">
          <Sidebar className="bg-card/35 sticky top-0 h-screen rounded-none border-y-0 border-l-0">
            <SidebarHeader>
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

            <SidebarFooter>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="bg-sidebar-accent/35 border-sidebar-border/80 hover:bg-sidebar-accent/55 flex w-full items-center gap-2 rounded-md border p-3 text-left transition-colors"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                      AK
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        Admin Keys
                      </p>
                      <p className="text-sidebar-foreground/70 truncate text-xs">
                        admin@luxekeys.io
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
                      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                        AK
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          Admin Keys
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          admin@luxekeys.io
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled>
                    <User className="size-4" />
                    Admin Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push('/login')}>
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
    </SidebarProvider>
  );
}
