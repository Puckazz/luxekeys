'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCartStore } from '@/features/shop/hooks/useCartStore';
import {
  selectWishlistItems,
  useWishlistStore,
} from '@/features/shop/hooks/useWishlistStore';
import type { ProductCollectionSectionProps } from '@/features/shop/types/product-collection-section.types';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProductCollectionSection({
  title,
  description,
  products,
  showControls,
  viewAllHref,
  viewAllLabel,
  className,
}: ProductCollectionSectionProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore(selectWishlistItems);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);

  const toUnitPrice = (price: string) => {
    const parsedValue = Number(price.replace(/[^0-9.]/g, ''));

    if (!Number.isFinite(parsedValue)) {
      return 0;
    }

    return parsedValue;
  };

  const toCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getDiscountedPrice = (price: string, discountPercentage?: number) => {
    const originalPrice = toUnitPrice(price);

    if (!discountPercentage) {
      return originalPrice;
    }

    const discountMultiplier = 1 - discountPercentage / 100;
    return Number((originalPrice * discountMultiplier).toFixed(2));
  };

  const handleAddToCart = (
    slug: string,
    name: string,
    price: string,
    image: string,
    discountPercentage?: number
  ) => {
    addItem({
      slug,
      name,
      variantLabel: 'Standard',
      unitPrice: getDiscountedPrice(price, discountPercentage),
      image,
      quantity: 1,
    });
  };

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const updateControls = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateControls();
    carouselApi.on('reInit', updateControls);
    carouselApi.on('select', updateControls);

    return () => {
      carouselApi.off('select', updateControls);
      carouselApi.off('reInit', updateControls);
    };
  }, [carouselApi]);

  return (
    <section
      className={cn(
        'mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground text-xs md:text-sm">
              {description}
            </p>
          ) : null}
        </div>

        {showControls ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Previous products"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Next products"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        ) : null}

        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
          >
            {viewAllLabel}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>

      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: 'start',
          dragFree: false,
          containScroll: 'trimSnaps',
        }}
      >
        <CarouselContent>
          {products.map((product) => {
            const isWished = wishlistItems.some(
              (wishlistItem) => wishlistItem.slug === product.slug
            );
            const discountedPrice = getDiscountedPrice(
              product.price,
              product.discountPercentage
            );

            return (
              <CarouselItem
                key={product.slug}
                className="basis-full sm:basis-1/2 lg:basis-1/4"
              >
                <article
                  className="group"
                  onMouseLeave={(event) => {
                    const focusedElement =
                      event.currentTarget.querySelector<HTMLElement>(':focus');
                    focusedElement?.blur();
                  }}
                >
                  <div className="relative">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="border-border/60 bg-card/35 relative overflow-hidden rounded-xl border">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        {product.badge ? (
                          <Badge className="absolute top-3 right-3">
                            {product.badge}
                          </Badge>
                        ) : null}
                        {product.discountPercentage ? (
                          <Badge
                            className="absolute top-3 left-3"
                            variant="destructive"
                          >
                            -{product.discountPercentage}%
                          </Badge>
                        ) : null}
                      </div>
                    </Link>

                    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex translate-y-3 justify-center gap-2 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() =>
                          handleAddToCart(
                            product.slug,
                            product.name,
                            product.price,
                            product.image,
                            product.discountPercentage
                          )
                        }
                        className="bg-background hover:bg-background/90 pointer-events-auto inline-flex size-11 items-center justify-center rounded-md text-white shadow-sm transition-colors"
                      >
                        <ShoppingBag className="size-5" />
                      </button>

                      <button
                        type="button"
                        aria-label={`${isWished ? 'Remove' : 'Add'} ${product.name} ${isWished ? 'from' : 'to'} wishlist`}
                        onClick={() => toggleWishlistItem(product)}
                        className="bg-background hover:bg-background/90 pointer-events-auto inline-flex size-11 items-center justify-center rounded-md text-white shadow-sm transition-colors"
                      >
                        <Heart
                          className={cn('size-5', isWished && 'fill-current')}
                        />
                      </button>
                    </div>
                  </div>

                  <Link href={`/products/${product.slug}`} className="block">
                    <h3 className="text-foreground mt-3 text-xl font-semibold">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {product.subtitle}
                    </p>
                    <div className="mt-2">
                      <p className="text-primary text-lg font-semibold">
                        {toCurrency(discountedPrice)}
                      </p>
                      {product.discountPercentage ? (
                        <p className="text-muted-foreground text-xs line-through">
                          {product.price}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
