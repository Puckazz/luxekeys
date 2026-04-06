'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { CreditCard, MapPin, PencilLine } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  CheckoutOrderSummaryCard,
  CheckoutStepper,
} from '@/features/shop/components/checkout';
import { useCheckoutFlow } from '@/features/shop/hooks/useCheckoutFlow';
import { useCheckoutStore } from '@/stores/shop/checkout.store';
import { formatCurrency } from '@/features/shop/utils/checkout.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export default function CheckoutReviewPage() {
  const router = useRouter();

  const hydrated = useCheckoutStore((state) => state.hydrated);
  const review = useCheckoutStore((state) => state.review);

  const { confirmCheckout, isConfirmingCheckout, checkoutConfirmError } =
    useCheckoutFlow();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!review) {
      router.replace('/checkout');
    }
  }, [hydrated, review, router]);

  const onCompletePurchase = async () => {
    await confirmCheckout();
    router.push('/checkout/confirmation');
  };

  if (!hydrated || !review) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mt-6">
        <CheckoutStepper currentStep="review" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/70 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-2">
                    <MapPin className="text-primary size-4" />
                    Shipping Address
                  </span>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="h-auto p-0 no-underline!"
                  >
                    <Link href="/checkout">
                      <PencilLine className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground space-y-1 text-sm">
                <p className="text-foreground font-semibold">
                  {review.shippingAddress.fullName}
                </p>
                <p>{review.shippingAddress.streetAddress}</p>
                <p>
                  {review.shippingAddress.district},{' '}
                  {review.shippingAddress.city}
                </p>
                <p>{review.shippingAddress.phone}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-2">
                    <CreditCard className="text-primary size-4" />
                    Payment Method
                  </span>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="h-auto p-0 no-underline!"
                  >
                    <Link href="/checkout">
                      <PencilLine className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-foreground text-lg font-semibold">
                  {review.paymentMethod.label}
                </p>
                <p className="text-muted-foreground text-sm">
                  {review.paymentMethod.description}
                </p>
                <Badge variant="tag" className="w-fit text-xs">
                  {review.shippingMethod.label}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/40">
            <CardHeader>
              <CardTitle className="text-2xl">Review Your Order</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {review.items.map((item, index) => (
                <div key={item.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="border-border/70 bg-card/70 relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground text-lg font-semibold">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {item.variantLabel}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="tag">Qty: {item.quantity}</Badge>
                        <Badge variant="success">In Stock</Badge>
                      </div>
                    </div>

                    <p className="text-foreground text-2xl font-semibold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>

                  {index < review.items.length - 1 ? (
                    <div className="border-border/70 mt-4 border-t" />
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          {checkoutConfirmError ? (
            <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {checkoutConfirmError.message}
            </div>
          ) : null}
        </div>

        <CheckoutOrderSummaryCard
          items={review.items}
          pricing={review.pricing}
          actionLabel="Complete Purchase"
          onAction={onCompletePurchase}
          isActionLoading={isConfirmingCheckout}
          promoCode={review.promoCode ?? undefined}
          legalText="By clicking 'Complete Purchase', you authorize LuxeKeys to charge your payment method and agree to our Terms of Service."
        />
      </div>
    </section>
  );
}
