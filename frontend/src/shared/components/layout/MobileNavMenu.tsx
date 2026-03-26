'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AtSign, Disc3, Menu, UserCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

type NavLinkItem = {
  label: string;
  href: string;
};

type NavSectionItem = {
  label: string;
  description: string;
  href: string;
};

type NavSection = {
  trigger: string;
  items: NavSectionItem[];
};

type MobileNavMenuProps = {
  navLinks: NavLinkItem[];
  navSections: NavSection[];
};

export default function MobileNavMenu({
  navLinks,
  navSections,
}: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    if (!shouldRender) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, shouldRender]);

  const openMenu = () => {
    setShouldRender(true);
    window.requestAnimationFrame(() => {
      setIsOpen(true);
    });
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        onClick={openMenu}
      >
        <Menu className="size-5" />
      </Button>

      {isMounted && shouldRender
        ? createPortal(
            <div
              className="fixed inset-0 z-120 lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <div
                aria-hidden="true"
                className={cn(
                  'fixed inset-0 bg-black/65 transition-opacity duration-260 ease-out',
                  isOpen ? 'opacity-100' : 'opacity-0'
                )}
                onClick={closeMenu}
              />

              <aside
                id="mobile-nav-panel"
                className={cn(
                  'bg-background border-border absolute top-0 left-0 z-10 h-dvh w-[min(22rem,88vw)] border-r shadow-xl transition-transform duration-260 ease-out',
                  isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
              >
                <div className="flex h-full flex-col">
                  <div className="border-border flex items-center justify-start border-b px-4 py-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close menu"
                      onClick={closeMenu}
                    >
                      <X className="size-5" />
                    </Button>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-2 py-3">
                    <Link
                      href={'/'}
                      onClick={closeMenu}
                      className="text-foreground hover:bg-muted block rounded-md px-3 py-2.5 text-base font-semibold transition-colors"
                    >
                      Home
                    </Link>
                    {navSections.map((section) => (
                      <details key={section.trigger} className="group mt-1">
                        <summary className="text-foreground hover:bg-muted flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-base font-semibold transition-colors">
                          {section.trigger}
                          <span className="text-muted-foreground text-sm transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>

                        <ul className="space-y-1 px-2 py-1">
                          {section.items.map((item) => (
                            <li key={item.label}>
                              <Link
                                href={item.href}
                                onClick={closeMenu}
                                className="hover:bg-muted/70 block rounded-md px-3 py-2"
                              >
                                <p className="text-foreground text-sm font-semibold">
                                  {item.label}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                                  {item.description}
                                </p>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}

                    {navLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMenu}
                        className="text-foreground hover:bg-muted block rounded-md px-3 py-2.5 text-base font-semibold transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="p-2">
                    <div className="flex items-center gap-2 px-1 py-2">
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

                  <div className="border-border border-t p-2">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="text-foreground hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-semibold transition-colors"
                    >
                      <UserCircle className="size-5" />
                      Account
                    </Link>
                  </div>
                </div>
              </aside>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
