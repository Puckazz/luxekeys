import Image from 'next/image';

import { Card } from '@/shared/components/ui/card';
import type { ProductMaterialsSectionProps } from '@/features/shop/types/product-detail.types';

export default function ProductMaterialsSection({
  showcase,
}: ProductMaterialsSectionProps) {
  return (
    <section className="from-background via-accent/10 to-background bg-linear-to-r">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 lg:px-8 lg:py-16">
        <div className="lg:pr-2">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            {showcase.eyebrow}
          </p>
          <h2 className="text-foreground mt-4 text-3xl font-black tracking-tight lg:text-4xl">
            {showcase.title}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base lg:mt-4">
            {showcase.description}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
            {showcase.samples.map((sample) => (
              <Card
                key={sample.id}
                className="bg-card/50 border-border/70 overflow-hidden rounded-[1.15rem]"
              >
                <div className="relative aspect-square">
                  <Image
                    src={sample.image}
                    alt={sample.name}
                    fill
                    sizes="(max-width: 1024px) 45vw, 220px"
                    className="object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-card/55 border-border/70 relative overflow-hidden rounded-[1.65rem]">
          <div className="relative aspect-4/5 min-h-80">
            <Image
              src={showcase.architectureImage}
              alt={showcase.architectureTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
            <div className="from-background/95 via-background/40 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-5 py-5 sm:px-6 sm:py-6">
              <h3 className="text-foreground text-lg font-bold tracking-tight lg:text-xl">
                {showcase.architectureTitle}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {showcase.architectureDescription}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
