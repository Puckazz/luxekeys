'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';

import ProductCollectionSection from '@/features/shop/components/ProductCollectionSection';
import { youMightAlsoLikeProducts } from '@/features/shop/mocks/cart.data';
import {
  selectCartItems,
  selectCartSubtotal,
  useCartStore,
} from '@/features/shop/hooks/useCartStore';
import { buildOrderPricing } from '@/features/shop/utils/checkout.utils';
import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { cn } from '@/lib/utils';

const toCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function CartPage() {
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore(selectCartItems);
  const subtotal = useCartStore(selectCartSubtotal);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!hydrated) {
    return null;
  }

  const pricing = buildOrderPricing({
    subtotal,
    shippingFee: 0,
    discountRate: 0,
  });

  const updateQuantity = (id: string, nextQuantity: number) => {
    setQuantity(id, nextQuantity);
  };

  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          className="mb-4 text-xs font-medium tracking-wide sm:text-sm"
          items={[{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }]}
        />

        <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          Shopping Cart
        </h1>

        <div
          className={cn(
            'mt-8 grid gap-8',
            items.length > 0 &&
              'lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_30rem]'
          )}
        >
          <div>
            {items.length === 0 ? (
              <div className="border-border/70 bg-card/30 rounded-2xl border p-10 text-center">
                <h2 className="text-foreground text-xl font-semibold">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Add a few items to continue to checkout.
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/products">Browse products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  return (
                    <article
                      key={item.id}
                      className="border-border/70 bg-card/40 rounded-2xl border p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                          href={`/products/${item.slug}`}
                          className="bg-card/60 border-border/60 relative aspect-square w-28 shrink-0 overflow-hidden rounded-sm border"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            // sizes="84px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-foreground hover:text-primary line-clamp-1 text-lg font-semibold transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.variantLabel}
                          </p>

                          <div className="border-input/80 bg-card mt-4 inline-flex items-center rounded-sm border px-3 py-2">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="hover:bg-transparent!"
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-foreground w-10 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="hover:bg-transparent!"
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-stretch sm:justify-between sm:gap-15">
                          <p className="text-foreground text-2xl font-semibold">
                            {toCurrency(item.unitPrice * item.quantity)}
                          </p>
                          <Button
                            variant="link"
                            size="lg"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive/80 h-auto p-0 leading-0 no-underline!"
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {items.length > 0 ? (
            <Card className="border-border/70 bg-card/40 h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">
                    {toCurrency(pricing.subtotal)}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <span>Shipping estimate</span>
                  <span className="text-foreground font-semibold">
                    {toCurrency(pricing.shipping)}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <span>Tax estimate</span>
                  <span className="text-foreground font-semibold">
                    {toCurrency(pricing.estimatedTax)}
                  </span>
                </div>

                <div className="border-border/70 mt-1 border-t py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground text-base font-semibold">
                      Order total
                    </p>
                    <p className="text-foreground text-xl font-black">
                      {toCurrency(pricing.total)}
                    </p>
                  </div>
                </div>

                <PrimaryButton asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="size-4" />
                  </Link>
                </PrimaryButton>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <ProductCollectionSection
        title="You might also like"
        description={undefined}
        products={youMightAlsoLikeProducts}
        showControls={false}
        viewAllHref="/products"
        viewAllLabel="View all"
        className="pb-14"
      />
    </div>
  );
}
