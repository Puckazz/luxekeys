import { Input } from '@/shared/components/ui/input';
import { PrimaryButtonLink } from '@/shared/components/ui/link-buttons';

export default function NewsletterSection() {
  return (
    <section className="border-border/50 bg-accent/15 border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-18 text-center sm:px-6 lg:px-8">
        <h2 className="text-foreground text-4xl font-bold tracking-tight">
          Stay in the Loop
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm sm:text-base">
          Get notified about upcoming drops, group buys, and enthusiast events.
        </p>

        <form className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            className="border-border/80 bg-card h-12 rounded-md px-4"
          />
          <PrimaryButtonLink href={'/'}>Subscribe</PrimaryButtonLink>
        </form>
      </div>
    </section>
  );
}
