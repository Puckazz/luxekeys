import Image from 'next/image';

import { Card, CardContent } from '@/shared/components/ui/card';
import type { ProductMaterialsSectionProps } from '@/features/shop/types/product-detail.types';

export default function ProductMaterialsSection({
  showcase,
}: ProductMaterialsSectionProps) {
  return (
    <section className="bg-accent/10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-8 lg:py-16">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            {showcase.eyebrow}
          </p>
          <h2 className="text-foreground mt-4 text-3xl font-black tracking-tight lg:text-4xl">
            {showcase.title}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base lg:mt-4">
            {showcase.description}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {showcase.samples.map((sample) => (
              <Card
                key={sample.id}
                className="bg-card/50 overflow-hidden rounded-[1.15rem]"
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
                <CardContent className="px-3 py-2.5">
                  <p className="text-foreground text-[0.7rem] font-semibold tracking-wider uppercase">
                    {sample.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-card/55 border-border/70 overflow-hidden rounded-[1.65rem]">
          <div className="relative min-h-72">
            <Image
              src={showcase.architectureImage}
              alt={showcase.architectureTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
          <CardContent className="p-5 sm:p-6">
            <h3 className="text-foreground text-lg font-bold tracking-tight lg:text-xl">
              {showcase.architectureTitle}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed lg:mt-3">
              {showcase.architectureDescription}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
