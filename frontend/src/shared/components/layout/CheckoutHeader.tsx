'use client';

import Link from 'next/link';
import { Keyboard, ShoppingBag } from 'lucide-react';

import {
  selectCartTotalQuantity,
  useCartStore,
} from '@/stores/shop/cart.store';
import { Badge } from '@/shared/components/ui/badge';

const countBadgeClass =
  'absolute top-0 right-0 inline-flex h-4 min-w-4 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full px-1 py-0 text-[10px] leading-none font-bold normal-case tracking-normal';

export default function CheckoutHeader() {
  const cartCount = useCartStore(selectCartTotalQuantity);

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Keyboard className="text-primary size-6" />
          <span className="text-foreground text-[16px] leading-6 font-bold tracking-tighter uppercase md:text-xl">
            LuxeKeys
          </span>
        </Link>

        <Link
          href="/cart"
          aria-label="Back to cart"
          className="text-foreground hover:text-primary relative inline-flex items-center gap-2 font-semibold transition-colors"
        >
          <ShoppingBag className="size-5" />
          {cartCount > 0 ? (
            <Badge className={countBadgeClass}>
              {cartCount > 99 ? '99+' : cartCount}
            </Badge>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
