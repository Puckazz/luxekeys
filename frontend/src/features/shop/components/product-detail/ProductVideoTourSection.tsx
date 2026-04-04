import Image from 'next/image';
import { Play } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { ProductVideoTourSectionProps } from '@/features/shop/types/product-detail.types';

export default function ProductVideoTourSection({
  videoTour,
}: ProductVideoTourSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-foreground text-3xl font-black tracking-tight lg:text-4xl">
          {videoTour.title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base lg:mt-4">
          {videoTour.description}
        </p>
      </div>

      <Card className="bg-card/55 border-border/70 relative mx-auto mt-9 max-w-5xl overflow-hidden rounded-[1.75rem]">
        <div className="relative aspect-16/8">
          <Image
            src={videoTour.coverImage}
            alt={videoTour.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1180px"
            className="object-cover"
          />

          <div className="from-background/80 via-background/10 absolute inset-0 bg-linear-to-t to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7 lg:p-8">
            <div>
              <p className="text-foreground text-base font-bold sm:text-lg">
                MK-90 Pro: The Ultimate Sound Test
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm">
                {videoTour.durationLabel} · 60 FPS · High Fidelity Audio
              </p>
            </div>

            <Button
              type="button"
              size="icon-lg"
              className="h-12 w-12 rounded-full"
              aria-label="Play product tour"
            >
              <Play className="size-5" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
