'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

import { featuredProducts } from '@/features/shop/mocks/homepage.data';
import type { FeaturedCollectionsSectionProps } from '@/features/shop/types/featured-collections.types';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

export default function FeaturedCollectionsSection({
  title = 'Featured Collections',
  description = 'The most sought-after boards in the enthusiast community.',
  products = featuredProducts,
  variant = 'featured',
  showControls = true,
  viewAllHref,
  viewAllLabel = 'View all',
  className,
}: FeaturedCollectionsSectionProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isCompact = variant === 'compact';

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
      <div
        className={cn(
          'mb-6 flex justify-between gap-4',
          isCompact ? 'items-center' : 'items-end'
        )}
      >
        <div>
          <h2
            className={cn(
              'text-foreground mb-2 text-2xl font-bold tracking-tight md:text-3xl',
              isCompact && 'mb-0 text-3xl'
            )}
          >
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
          {products.map((product) => (
            <CarouselItem
              key={product.slug}
              className="basis-full sm:basis-1/2 lg:basis-1/4"
            >
              {isCompact ? (
                <Link
                  href={`/products/${product.slug}`}
                  className="group block h-full"
                >
                  <article className="border-border/60 bg-card/35 h-full overflow-hidden rounded-2xl border">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        aria-hidden="true"
                        className="bg-background/75 text-foreground absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full"
                      >
                        <Heart className="size-4" />
                      </span>
                    </div>
                    <div className="border-border/60 bg-background/60 border-t px-4 py-3">
                      <h3 className="text-foreground text-base font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {product.subtitle}
                      </p>
                      <p className="text-foreground mt-2 text-2xl font-semibold">
                        {product.price}
                      </p>
                    </div>
                  </article>
                </Link>
              ) : (
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                >
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
                      <span className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-semibold">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-foreground mt-3 text-xl font-semibold">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {product.subtitle}
                  </p>
                  <p className="text-primary mt-2 text-lg font-semibold">
                    {product.price}
                  </p>
                </Link>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
