import {
  OutlineButtonLink,
  PrimaryButtonLink,
} from '@/shared/components/ui/link-buttons';

export default function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="border-border relative flex items-center overflow-hidden rounded-xl border bg-linear-to-br from-[#041126] via-[#071a37] to-[#03101f] px-6 py-16 sm:px-10 md:rounded-4xl md:px-14 lg:min-h-145 lg:py-24">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(2,8,23,0.95) 12%, rgba(2,8,23,0.72) 55%, rgba(2,8,23,0.88) 100%), url(https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1800&q=80)',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="border-primary/40 bg-primary/20 text-primary inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            NEW ARRIVAL
          </p>
          <h1 className="text-foreground mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            TYPING <span className="text-primary">ELEVATED</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Precision-engineered instruments for enthusiasts who demand absolute
            acoustic and tactile perfection.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButtonLink href="/">Explore Collection</PrimaryButtonLink>
            <OutlineButtonLink href="/">Configure Custom</OutlineButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
