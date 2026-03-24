import Image from 'next/image';

import { countdownItems } from '@/features/shop/mocks/homepage.data';
import {
  OutlineButtonLink,
  PrimaryButtonLink,
} from '@/shared/components/ui/link-buttons';

export default function GroupBuySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
      <div className="border-border/65 relative overflow-hidden rounded-2xl border bg-linear-to-r from-[#061736] via-[#081e43] to-[#041327] p-6 sm:p-10 lg:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              ACTIVE GROUP BUY
            </p>
            <h2 className="text-foreground mt-4 text-4xl leading-tight font-black tracking-tight sm:text-5xl">
              The Archon 75
            </h2>
            <p className="text-muted-foreground text-3xl leading-none font-semibold italic">
              Collector&apos;s Edition
            </p>
            <p className="text-muted-foreground mt-5 max-w-lg text-base leading-relaxed">
              Our most ambitious project yet. Featuring a weight made of real
              brass and a unique acoustic chamber design.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {countdownItems.map((item) => (
                <div
                  key={item.label}
                  className="border-border/70 bg-background/40 min-w-16 rounded-xl border px-3 py-2 text-center"
                >
                  <p className="text-foreground text-2xl leading-none font-black">
                    {item.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[0.65rem] font-semibold tracking-wider uppercase">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryButtonLink href="/">Join Group Buy</PrimaryButtonLink>
              <OutlineButtonLink href="/">View Specs</OutlineButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="bg-primary/10 absolute -inset-4 rounded-2xl blur-3xl" />
            <div className="border-border/60 bg-card/30 relative overflow-hidden rounded-2xl border p-3">
              <div className="relative aspect-5/3 overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1627920769842-6887c6df05ca?auto=format&fit=crop&w=1600&q=80"
                  alt="The Archon 75 Collector's Edition"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
