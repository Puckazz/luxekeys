import Link from 'next/link';
import { Heart, Keyboard, Search, ShoppingBag, UserCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const navItems = [
  'Prebuilt',
  'Custom Kits',
  'Switches',
  'Keycaps',
  'Accessories',
];

export default function Header() {
  return (
    <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Keyboard className="text-primary font-bold" />
          <span className="text-foreground text-xl font-bold tracking-tighter">
            LUXEKEYS
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden w-full max-w-xs items-center lg:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search boards..."
              className="border-border/80 bg-card h-10 rounded-full pl-9"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" aria-label="Cart">
            <ShoppingBag className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Account">
            <Heart className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Account">
            <UserCircle className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
