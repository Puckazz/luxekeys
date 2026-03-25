import Link from 'next/link';
import {
  Heart,
  Keyboard,
  Menu,
  Search,
  SearchIcon,
  ShoppingBag,
  UserCircle,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';

const navLinkClass =
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent! px-4 py-2 text-base font-bold outline-none transition-[color,background-color] hover:text-accent-foreground hover:bg-transparent! focus:bg-transparent! disabled:pointer-events-none disabled:opacity-50 data-active:bg-transparent data-state-open:bg-transparent';

const keyboardItems = [
  {
    label: '65% Keyboards',
    description: 'Compact layout for desk setup and portability.',
    href: '/',
  },
  {
    label: '75% Keyboards',
    description: 'Balanced layout with function row for daily use.',
    href: '/',
  },
  {
    label: 'TKL Keyboards',
    description: 'Full nav cluster without numpad for more mouse room.',
    href: '/',
  },
];

const accessoryItems = [
  {
    label: 'Desk Mats',
    description: 'Premium mats with stitched edges and unique artwork.',
    href: '/',
  },
  {
    label: 'Wrist Rests',
    description: 'Wood and resin rests for long typing sessions.',
    href: '/',
  },
  {
    label: 'Cables',
    description: 'Coiled and straight cables for custom keyboard builds.',
    href: '/',
  },
];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Switches', href: '/' },
  { label: 'Keycaps', href: '/' },
  { label: 'Group Buy', href: '/' },
];

const navSections = [
  { trigger: 'Keyboards', items: keyboardItems },
  { trigger: 'Accessories', items: accessoryItems },
];

export default function Header() {
  return (
    <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden xl:flex">
          <Button variant="ghost" size="icon-sm" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Keyboard className="text-primary" size={28} />
          <span className="text-foreground text-xl leading-6 font-bold tracking-tighter uppercase">
            LuxeKeys
          </span>
        </Link>

        <nav className="hidden flex-1 items-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navLinkClass}>
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {navSections.map((section) => (
                <NavigationMenuItem key={section.trigger}>
                  <NavigationMenuTrigger className={navLinkClass}>
                    {section.trigger}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background! top-full left-0 z-50 mt-2 h-auto max-h-none w-max max-w-3xl overflow-visible! md:absolute">
                    <ul className="grid min-w-88 gap-2 p-4">
                      {section.items.map((item) => (
                        <li key={item.label}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="hover:bg-input/40! hover:text-primary focus:bg-input/40 focus:text-foreground flex flex-col items-start gap-1.5 rounded-md p-4 text-left transition-colors outline-none"
                            >
                              <div className="text-base font-semibold">
                                {item.label}
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {navLinks.slice(1).map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild className={navLinkClass}>
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="hidden w-full max-w-xs items-center xl:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search keyboards..."
              className="border-border/80 bg-card h-10 rounded-full pl-9"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search"
            className="xl:hidden"
          >
            <SearchIcon className="size-5" />
          </Button>
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
