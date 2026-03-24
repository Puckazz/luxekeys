import Link from 'next/link';
import { AtSign, Disc3 } from 'lucide-react';

const shopLinks = ['Keyboards', 'Keycaps', 'Switches', 'Artisans'];
const supportLinks = ['Track Order', 'Shipping Policy', 'Returns', 'FAQ'];

export default function Footer() {
  return (
    <footer className="border-border/50 bg-accent/20 border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-md px-1.5 py-1 text-[0.65rem] leading-none font-bold tracking-wide">
              LX
            </div>
            <span className="text-foreground text-sm font-bold tracking-wide">
              LUXEKEYS
            </span>
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Premium mechanical keyboards and accessories for the refined
            enthusiast. Based in Tokyo, shipping worldwide.
          </p>
        </div>

        <div>
          <h3 className="text-foreground/90 mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
            SHOP
          </h3>
          <ul className="text-muted-foreground space-y-3 text-sm">
            {shopLinks.map((link) => (
              <li key={link}>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-foreground/90 mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
            SUPPORT
          </h3>
          <ul className="text-muted-foreground space-y-3 text-sm">
            {supportLinks.map((link) => (
              <li key={link}>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-foreground/90 mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
            CONNECT
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="border-border/70 bg-card/40 text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-full border transition-colors"
              aria-label="Email"
            >
              <AtSign className="size-4" />
            </Link>
            <Link
              href="/"
              className="border-border/70 bg-card/40 text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-full border transition-colors"
              aria-label="Community"
            >
              <Disc3 className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-border/50 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-xs sm:px-6 sm:text-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2024 LUXEKEYS INC. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
