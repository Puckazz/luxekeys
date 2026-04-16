import Image from 'next/image';
import { ArrowRight, AudioWaveform, Gem, Layers3, Users } from 'lucide-react';

import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  OutlineButtonLink,
  PrimaryButtonLink,
} from '@/shared/components/ui/link-buttons';

const aboutHighlights = [
  {
    title: 'Precision',
    description:
      'Every board is tuned around a deliberate balance of layout, feel, and workflow clarity.',
    icon: Layers3,
  },
  {
    title: 'Materials',
    description:
      'We favor finishes, metals, and polymers that age beautifully under everyday use.',
    icon: Gem,
  },
  {
    title: 'Sound',
    description:
      'Acoustic character matters as much as looks, so each kit is selected for a clean, satisfying signature.',
    icon: AudioWaveform,
  },
  {
    title: 'Community',
    description:
      'LuxeKeys grows alongside enthusiasts, builders, and collectors who shape what premium can mean.',
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="border-border relative overflow-hidden rounded-xl border bg-linear-to-br from-[#041126] via-[#071a37] to-[#03101f] px-6 py-10 sm:px-10 md:rounded-4xl md:px-14 md:py-14 lg:py-18">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(2,8,23,0.96) 14%, rgba(2,8,23,0.76) 56%, rgba(2,8,23,0.92) 100%), url(https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1800&q=80)',
            }}
          />

          <div className="relative max-w-3xl">
            <PageBreadcrumb
              className="mb-5 text-xs font-medium tracking-wide text-white/70 sm:text-sm"
              items={[{ label: 'Home', href: '/' }, { label: 'About' }]}
            />

            <p className="border-primary/40 bg-primary/20 text-primary inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              OUR PHILOSOPHY
            </p>
            <h1 className="text-foreground mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Crafted for people who hear every keystroke and feel every
              detail.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
              LuxeKeys curates premium mechanical keyboards and accessories with
              a sharp eye for acoustics, materials, and the rituals that make a
              desk setup feel personal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButtonLink href="/products/keyboards">
                Explore Keyboards
              </PrimaryButtonLink>
              <OutlineButtonLink href="/products">
                Browse Collections
              </OutlineButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-18 sm:px-6 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center lg:gap-14 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/30">
          <div className="absolute inset-0 bg-linear-to-t from-background/45 via-transparent to-transparent" />
          <Image
            src="https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1400&q=80"
            alt="Desk setup with premium mechanical keyboard"
            width={1400}
            height={1200}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
            BRAND STORY
          </p>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            We build the kind of collection enthusiasts keep coming back to.
          </h2>
          <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-7 sm:text-base">
            <p>
              LuxeKeys started from a simple belief: premium typing gear should
              feel intentional in every layer, from the first visual impression
              to the final acoustic note on the desk.
            </p>
            <p>
              Our curation focuses on pieces that reward long-term ownership,
              whether that means tighter machining, richer material contrast, or
              layouts that make everyday work feel more composed.
            </p>
            <p>
              The result is a storefront shaped less like a catalog and more
              like a studio selection for collectors, creators, and anyone who
              wants their setup to feel quietly exceptional.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
              WHAT GUIDES US
            </p>
            <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Four standards behind every drop.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed md:text-right">
            From sourcing to presentation, each decision is meant to support a
            more refined typing experience rather than chasing novelty alone.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {aboutHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="h-full">
                <CardHeader>
                  <div className="bg-primary/14 text-primary flex size-11 items-center justify-center rounded-2xl">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="pb-18">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-border/70 bg-accent/20 rounded-3xl border px-6 py-10 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
                READY TO EXPLORE
              </p>
              <h2 className="text-foreground text-3xl font-bold tracking-tight">
                Find the setup that feels unmistakably yours.
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
                Browse our keyboard collection and discover boards, keycaps, and
                accessories chosen for both performance and presence.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
              <PrimaryButtonLink href="/products/keyboards">
                Shop Keyboards
              </PrimaryButtonLink>
              <OutlineButtonLink href="/products">
                View All Products
                <ArrowRight className="size-4" />
              </OutlineButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
