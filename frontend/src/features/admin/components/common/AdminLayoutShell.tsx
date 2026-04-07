'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, LayoutGrid, Package, Tag } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
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

  return (
    <SidebarProvider>
      <section className="w-full">
        <div className="flex min-h-screen items-start gap-0">
          <Sidebar className="sticky top-0 h-screen rounded-none border-y-0 border-l-0">
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
                      <SidebarMenuButton asChild isActive={isActive}>
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
