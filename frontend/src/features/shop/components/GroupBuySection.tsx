import Image from 'next/image';

import { countdownItems } from '@/features/shop/mocks/homepage.data';
import {
  OutlineButtonLink,
  PrimaryButtonLink,
} from '@/shared/components/ui/link-buttons';

export default function GroupBuySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
      <div className="border-border/65 relative overflow-hidden rounded-xl border bg-[#041327] p-6 sm:p-10 md:rounded-4xl lg:p-16">
        <div className="absolute inset-y-0 right-0 z-0 w-full lg:w-[52%]">
          <Image
            src="https://images.unsplash.com/photo-1626958390898-162d3577f293?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="The Archon 75 Collector's Edition"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center"
          />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-r from-[#061736] via-[#081e43]/92 to-transparent" />

        <div className="relative z-20 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              ACTIVE GROUP BUY
            </p>
            <h2 className="text-foreground mt-4 text-4xl leading-tight font-black tracking-tight sm:text-5xl">
              The Archon 75
            </h2>
            <p className="text-muted-foreground text-3xl leading-none font-semibold italic">
              Collector&apos;s Edition
            </p>
            <p className="text-muted-foreground mt-6 max-w-sm text-base leading-relaxed">
              Our most ambitious project yet. Featuring a weight made of real
              brass and a unique acoustic chamber design.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {countdownItems.map((item) => (
                <div
                  key={item.label}
                  className="border-border bg-background/40 min-w-16 rounded-md border px-4 py-3 text-center"
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

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PrimaryButtonLink href="/">Join Group Buy</PrimaryButtonLink>
              <OutlineButtonLink href="/">View Specs</OutlineButtonLink>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
