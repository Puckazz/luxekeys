'use client';

import { usePathname } from 'next/navigation';

import CheckoutHeader from '@/shared/components/layout/CheckoutHeader';
import Footer from '@/shared/components/layout/Footer';
import Header from '@/shared/components/layout/Header';

type ShopLayoutShellProps = Readonly<{
  children: React.ReactNode;
}>;

export default function ShopLayoutShell({ children }: ShopLayoutShellProps) {
  const pathname = usePathname();
  const isCheckoutRoute = pathname.startsWith('/checkout');

  if (isCheckoutRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <CheckoutHeader />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
