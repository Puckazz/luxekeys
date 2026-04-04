import { Layers3, Radio, Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/shared/components/ui/card';
import type { ProductTechnicalSpecsSectionProps } from '@/features/shop/types/product-detail.types';

const specIcons = [Layers3, Radio, Sparkles];

export default function ProductTechnicalSpecsSection({
  heading,
  description,
  specs,
}: ProductTechnicalSpecsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-foreground text-3xl font-black tracking-tight lg:text-4xl">
          {heading}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base lg:mt-4">
          {description}
        </p>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-3 lg:gap-5">
        {specs.map((spec, index) => {
          const Icon = specIcons[index % specIcons.length];

          return (
            <Card key={spec.id} className="bg-card/45 rounded-[1.6rem]">
              <CardContent className="h-full p-5 sm:p-5 lg:p-6">
                <div className="bg-primary/15 text-primary mb-4 inline-flex size-8 items-center justify-center rounded-full lg:size-9">
                  <Icon className="size-4" />
                </div>

                <h3 className="text-foreground text-lg font-bold tracking-tight lg:text-xl">
                  {spec.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {spec.description}
                </p>

                <ul className="text-muted-foreground mt-4 space-y-1.5 text-xs leading-5">
                  {spec.bullets.map((bullet) => (
                    <li
                      key={`${spec.id}-${bullet}`}
                      className="before:text-primary before:mr-2 before:content-['•']"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
