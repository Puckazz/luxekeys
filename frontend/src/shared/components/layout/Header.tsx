'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Keyboard,
  Loader2,
  Search,
  SearchIcon,
  ShoppingBag,
  UserCircle,
} from 'lucide-react';

import { useProductSearchQuery } from '@/features/shop/hooks/useProductSearchQuery';
import MobileNavMenu from '@/shared/components/layout/MobileNavMenu';
import { Badge } from '@/shared/components/ui/badge';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  selectCartTotalQuantity,
  useCartStore,
} from '@/stores/shop/cart.store';
import {
  selectWishlistCount,
  useWishlistStore,
} from '@/stores/shop/wishlist.store';
import { useAuthStore } from '@/stores/auth/auth.store';

const SEARCH_DEBOUNCE_MS = 300;

const navLinkClass =
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent! min-[1400px]:px-4 px-2 py-2 text-base font-bold outline-none transition-[color,background-color] hover:text-accent-foreground hover:bg-transparent! focus:bg-transparent! disabled:pointer-events-none disabled:opacity-50 data-active:bg-transparent data-state-open:bg-transparent';

const keyboardItems = [
  {
    label: 'All Keyboards',
    description: 'Browse every keyboard layout and build style.',
    href: '/products/keyboards',
  },
  {
    label: '65% Keyboards',
    description: 'Compact layout for desk setup and portability.',
    href: '/products/keyboards?layouts=65%25',
  },
  {
    label: '75% Keyboards',
    description: 'Balanced layout with function row for daily use.',
    href: '/products/keyboards?layouts=75%25',
  },
  {
    label: 'TKL Keyboards',
    description: 'Full nav cluster without numpad for more mouse room.',
    href: '/products/keyboards?layouts=TKL',
  },
];

const accessoryItems = [
  {
    label: 'All Accessories',
    description: 'Browse every desk mat, cable, and typing add-on.',
    href: '/products/accessories',
  },
  {
    label: 'Desk Mats',
    description: 'Premium mats with stitched edges and unique artwork.',
    href: '/products/accessories?categorySlugs=desk-mats',
  },
  {
    label: 'Wrist Rests',
    description: 'Wood and resin rests for long typing sessions.',
    href: '/products/accessories?categorySlugs=wrist-rests',
  },
  {
    label: 'Cables',
    description: 'Coiled and straight cables for custom keyboard builds.',
    href: '/products/accessories?categorySlugs=cables',
  },
];

const navLinks = [
  { label: 'Switches', href: '/products/switches' },
  { label: 'Keycaps', href: '/products/keycaps' },
  { label: 'About', href: '/about' },
];

const navSections = [
  { trigger: 'Keyboards', items: keyboardItems },
  { trigger: 'Accessories', items: accessoryItems },
];

const countBadgeClass =
  'absolute top-0 right-0 inline-flex h-4 min-w-4 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full px-1 py-0 text-[10px] leading-none font-bold normal-case tracking-normal';

const quickSearchKeywords = [
  '65% keyboard',
  'wireless keyboard',
  'linear switches',
  'PBT keycaps',
];

export default function Header() {
  const router = useRouter();
  const cartCount = useCartStore(selectCartTotalQuantity);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const isAuthenticated = useAuthStore(
    (state) => state.status === 'authenticated'
  );
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const accountHref = isAuthenticated ? '/account' : '/login';

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchKeyword);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Reset search state when sheet closes
  useEffect(() => {
    if (!isSearchSheetOpen) {
      setSearchKeyword('');
      setDebouncedQuery('');
    }
  }, [isSearchSheetOpen]);

  const { data: searchResults, isFetching: isSearchFetching } =
    useProductSearchQuery(debouncedQuery);

  const showResults =
    debouncedQuery.trim().length >= 2 && searchResults !== undefined;
  const hasResults = showResults && searchResults.length > 0;
  const showEmpty =
    showResults && !isSearchFetching && searchResults.length === 0;

  const openSearchSheet = () => {
    setIsSearchSheetOpen(true);
  };

  const navigateToSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      router.push('/products');
      return;
    }

    const searchParams = new URLSearchParams({ query: trimmedKeyword });
    router.push(`/products?${searchParams.toString()}`);
  };

  const handleSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearchSheetOpen(false);
    navigateToSearch(searchKeyword);
  };

  const handleQuickSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setIsSearchSheetOpen(false);
    navigateToSearch(keyword);
  };

  const handleResultClick = () => {
    setIsSearchSheetOpen(false);
  };

  return (
    <>
      <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 lg:hidden">
            <MobileNavMenu
              accountHref={accountHref}
              navLinks={navLinks}
              navSections={navSections}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search"
              onClick={openSearchSheet}
              className="md:hidden"
            >
              <SearchIcon className="size-5" />
            </Button>
          </div>

          <Link
            href="/"
            className="absolute right-1/2 flex translate-x-1/2 items-center gap-2 lg:static lg:translate-x-0"
          >
            <Keyboard className="text-primary md:size-7" />
            <span className="text-foreground text-[16px] leading-6 font-bold tracking-tighter uppercase md:text-xl">
              LuxeKeys
            </span>
          </Link>

          <nav className="hidden flex-1 items-center lg:flex">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navLinkClass}>
                    <Link href="/products">All products</Link>
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

                {navLinks.map((item) => (
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
                readOnly
                placeholder="Search keyboards..."
                aria-label="Open search"
                onClick={openSearchSheet}
                onFocus={openSearchSheet}
                className="border-border/80 bg-card h-10 rounded-full pl-9"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search"
              onClick={openSearchSheet}
              className="hidden md:block xl:hidden"
            >
              <SearchIcon className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="hover:bg-transparent! focus:bg-transparent!"
            >
              <Link href="/cart" aria-label="Cart" className="relative">
                <ShoppingBag className="size-5" />
                {cartCount > 0 ? (
                  <Badge className={countBadgeClass}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="hover:bg-transparent! focus:bg-transparent!"
            >
              <Link href="/wishlist" aria-label="Wishlist" className="relative">
                <Heart className="size-5" />
                {wishlistCount > 0 ? (
                  <Badge className={countBadgeClass}>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              aria-label="Account"
              className="hidden hover:bg-transparent! focus:bg-transparent! md:inline-flex"
            >
              <Link href={accountHref}>
                <UserCircle className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
        <SheetContent
          side="top"
          className="bg-background/98 mx-auto w-full max-w-3xl rounded-b-2xl border-x border-b p-0 shadow-2xl"
        >
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>Search Products</SheetTitle>
            <SheetDescription>
              Find keyboards, switches, keycaps, and accessories.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-6 sm:px-6">
            <form onSubmit={handleSubmitSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  autoFocus
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Type product name, switch type, or brand..."
                  className="h-11 pl-9"
                />
              </div>
              <Button type="submit" className="h-11 px-5">
                Search
              </Button>
            </form>

            {/* Quick search pills — hidden once user starts typing */}
            {!searchKeyword && (
              <div className="flex flex-wrap gap-2">
                {quickSearchKeywords.map((keyword) => (
                  <Button
                    key={keyword}
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => handleQuickSearch(keyword)}
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            )}

            {/* Live search results */}
            {searchKeyword.trim().length >= 2 && (
              <div className="space-y-1">
                {isSearchFetching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="text-muted-foreground size-5 animate-spin" />
                  </div>
                )}

                {showEmpty && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No products found for &ldquo;{debouncedQuery}&rdquo;.
                  </p>
                )}

                {hasResults && (
                  <>
                    <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                      {searchResults.length} result
                      {searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <ul className="divide-border divide-y">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={handleResultClick}
                            className="hover:bg-accent/50 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
                          >
                            <div className="bg-card border-border relative size-12 shrink-0 overflow-hidden rounded-md border">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground truncate text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {product.brand}
                              </p>
                            </div>
                            <span className="text-foreground shrink-0 text-sm font-semibold">
                              ${product.price.toFixed(2)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-primary w-full text-sm"
                        onClick={() => {
                          setIsSearchSheetOpen(false);
                          navigateToSearch(searchKeyword);
                        }}
                      >
                        See all results for &ldquo;{debouncedQuery}&rdquo;
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
