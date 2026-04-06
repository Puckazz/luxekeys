'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useCheckoutStore } from '@/stores/shop/checkout.store';
import { formatCurrency } from '@/features/shop/utils/checkout.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function CheckoutConfirmationPage() {
  const router = useRouter();

  const hydrated = useCheckoutStore((state) => state.hydrated);
  const confirmation = useCheckoutStore((state) => state.confirmation);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!confirmation) {
      router.replace('/checkout');
    }
  }, [hydrated, confirmation, router]);

  if (!hydrated || !confirmation) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Card className="border-border/70 bg-card/40 overflow-hidden border">
        <CardHeader className="border-border/70 from-primary/18 to-card/10 border-b bg-linear-to-br">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <CheckCircle2 className="text-primary size-14" />
            <CardTitle className="mt-4 text-3xl font-black">
              Order Confirmed
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Thanks for your purchase. Your order has been confirmed and is now
              being prepared.
            </p>
            <p className="text-primary border-primary/40 bg-primary/10 mt-4 rounded-full border px-4 py-1 text-sm font-semibold">
              Order #{confirmation.orderId}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="border-border/70 bg-background/20 rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="text-primary size-4" />
              <h2 className="text-foreground text-base font-semibold">
                Shipment Overview
              </h2>
            </div>

            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {confirmation.review.shippingAddress.fullName},{' '}
              {confirmation.review.shippingAddress.streetAddress},{' '}
              {confirmation.review.shippingAddress.district},{' '}
              {confirmation.review.shippingAddress.city}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Method: {confirmation.review.shippingMethod.label}
            </p>
          </div>

          <div className="space-y-4">
            {confirmation.review.items.map((item) => (
              <div
                key={item.id}
                className="border-border/70 bg-card/40 flex items-center gap-4 rounded-xl border p-3"
              >
                <div className="border-border/70 bg-card/70 relative size-16 shrink-0 overflow-hidden rounded-sm border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground line-clamp-1 text-sm font-semibold">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-foreground text-sm font-semibold">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-border/70 grid gap-3 border-t pt-4 sm:grid-cols-2">
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
