'use client';

import Image from 'next/image';
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/components/ui/carousel';
import type {
  ProductDetailHeroProps,
  ProductStockBadgeProps,
} from '@/features/shop/types/product-detail.types';

const stockBadgeVariantMap = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'secondary',
} as const;

const toCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

function ProductStockBadge({ status, label }: ProductStockBadgeProps) {
  return <Badge variant={stockBadgeVariantMap[status]}>{label}</Badge>;
}

const paymentMethods = ['VISA', 'PayPal', 'Mastercard', 'AMEX', 'Amazon Pay'];

export default function ProductDetailHeroSection({
  product,
  selectedImageId,
  selectedSwitch,
  selectedColor,
  quantity,
  onImageSelect,
  onSwitchSelect,
  onColorSelect,
  onQuantityDecrease,
  onQuantityIncrease,
}: ProductDetailHeroProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const thumbnailButtonRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {}
  );

  const selectedImageIndex = useMemo(() => {
    const index = product.gallery.findIndex(
      (image) => image.id === selectedImageId
    );
    return index >= 0 ? index : 0;
  }, [product.gallery, selectedImageId]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    if (carouselApi.selectedScrollSnap() === selectedImageIndex) {
      return;
    }

    carouselApi.scrollTo(selectedImageIndex);
  }, [carouselApi, selectedImageIndex]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const syncSelectedImage = () => {
      const nextIndex = carouselApi.selectedScrollSnap();
      const nextImage = product.gallery[nextIndex];

      if (!nextImage || nextImage.id === selectedImageId) {
        return;
      }

      onImageSelect(nextImage.id);
    };

    syncSelectedImage();
    carouselApi.on('select', syncSelectedImage);
    carouselApi.on('reInit', syncSelectedImage);

    return () => {
      carouselApi.off('select', syncSelectedImage);
      carouselApi.off('reInit', syncSelectedImage);
    };
  }, [carouselApi, onImageSelect, product.gallery, selectedImageId]);

  useEffect(() => {
    const activeThumbnail = thumbnailButtonRefs.current[selectedImageId];

    if (!activeThumbnail) {
      return;
    }

    activeThumbnail.scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, [selectedImageId]);

  return (
    <section className="from-background via-background to-accent/10 bg-linear-to-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          className="mb-4 text-xs font-medium tracking-wide sm:text-sm"
          items={[
            { label: 'Mechanical Keyboards', href: '/products' },
            { label: product.series },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <Carousel setApi={setCarouselApi} className="relative">
              <CarouselContent>
                {product.gallery.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <div className="bg-card/60 border-border/70 relative aspect-5/4 overflow-hidden rounded-[1.75rem] border">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                        priority={index === 0}
                      />

                      <Badge
                        className="absolute top-5 left-5"
                        variant="default"
                      >
                        Premium Edition
                      </Badge>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious
                className="bg-background/80 border-border/60! top-auto bottom-4 left-4 translate-y-0"
                aria-label="Previous product image"
              />
              <CarouselNext
                className="bg-background/80 border-border/60! top-auto right-4 bottom-4 translate-y-0"
                aria-label="Next product image"
              />
            </Carousel>

            <div className="mt-5 overflow-x-auto px-0.5 pb-1">
              <div className="flex min-w-max gap-2">
                {product.gallery.map((image) => {
                  const isActive = image.id === selectedImageId;

                  return (
                    <button
                      key={image.id}
                      ref={(node) => {
                        thumbnailButtonRefs.current[image.id] = node;
                      }}
                      type="button"
                      onClick={() => onImageSelect(image.id)}
                      style={{ width: 'calc((100% - 2rem) / 5)' }}
                      className={
                        isActive
                          ? 'border-primary/90 focus-visible:ring-ring relative aspect-square shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset'
                          : 'hover:border-primary/90 focus-visible:ring-ring relative aspect-square shrink-0 overflow-hidden rounded-xl border-2 border-transparent transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset'
                      }
                      aria-label={`Show image ${image.alt}`}
                      aria-pressed={isActive}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 14vw"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const isFilled = index < Math.round(product.rating);

                  return (
                    <Star
                      key={`${product.slug}-star-${index + 1}`}
                      className={
                        isFilled
                          ? 'size-4 fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/50 size-4'
                      }
                    />
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {product.rating.toFixed(1)} (
                {product.reviewCount.toLocaleString()} reviews)
              </p>
              <ProductStockBadge
                status={product.stockStatus}
                label={product.stockLabel}
              />
            </div>

            <p className="text-foreground mt-5 text-4xl font-extrabold tracking-tight lg:text-[2.65rem]">
              {toCurrency(product.price)}
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-foreground text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
                  Switch Type
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  {product.switchOptions.map((switchType) => {
                    const isActive = switchType === selectedSwitch;

                    return (
                      <Button
                        key={`${product.slug}-switch-${switchType}`}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => onSwitchSelect(switchType)}
                      >
                        {switchType}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-foreground text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
                  Color
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  {product.colorOptions.map((color) => {
                    const isActive = color === selectedColor;

                    return (
                      <Button
                        key={`${product.slug}-color-${color}`}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => onColorSelect(color)}
                      >
                        {color}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-foreground text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
                  Quantity
                </p>
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="bg-card/70 border-border/70 inline-flex items-center gap-2 rounded-full border px-2 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onQuantityDecrease}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="text-foreground min-w-6 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onQuantityIncrease}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex gap-3">
              <Button className="h-12 flex-1 rounded-full text-sm font-semibold sm:text-base">
                <ShoppingCart className="mr-2 size-4" />
                Add to Cart
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="h-12 w-12 rounded-full"
                aria-label="Add to wishlist"
              >
                <Heart className="size-5" />
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="border-border/70 bg-card/35 flex min-h-28 flex-col items-center justify-center rounded-2xl border px-4 py-5 text-center">
                <Truck className="text-foreground size-5" />
                <p className="text-foreground mt-3 text-sm leading-relaxed">
                  Estimate delivery times:{' '}
                  <span className="font-semibold">7-15 days</span>{' '}
                  (International),{' '}
                  <span className="font-semibold">5-10 days</span> (United
                  States).
                </p>
              </div>

              <div className="border-border/70 bg-card/35 flex min-h-28 flex-col items-center justify-center rounded-2xl border px-4 py-5 text-center">
                <RotateCcw className="text-foreground size-5" />
                <p className="text-foreground mt-3 text-sm leading-relaxed">
                  Return within <span className="font-semibold">30 days</span>{' '}
                  of purchase. Duties and taxes are non-refundable.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="mr-2 flex items-center gap-2">
                <ShieldCheck className="text-foreground size-4" />
                <p className="text-foreground text-sm leading-tight font-semibold">
                  Guarantee Safe Checkout
                </p>
              </div>

              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="border-border/70 bg-card/40 text-foreground rounded-md border px-3 py-1.5 text-xs font-semibold"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
