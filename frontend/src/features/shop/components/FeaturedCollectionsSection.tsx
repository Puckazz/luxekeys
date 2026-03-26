'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { featuredProducts } from '@/features/shop/mocks/homepage.data';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel';
import { Button } from '@/shared/components/ui/button';

export default function FeaturedCollectionsSection() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
    };
  }, [carouselApi]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground mb-2 text-2xl md:text-3xl font-bold tracking-tight">
            Featured Collections
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            The most sought-after boards in the enthusiast community.
          </p>
        </div>
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
          {featuredProducts.map((product) => (
            <CarouselItem
              key={product.name}
              className="basis-full sm:basis-1/2 lg:basis-1/4"
            >
              <article className="group">
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
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
