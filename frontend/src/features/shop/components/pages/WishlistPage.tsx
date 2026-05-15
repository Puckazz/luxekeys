'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import {
  ProductPagination,
  ShopProductCard,
} from '@/features/shop/components/product-list';
import { useCartActions } from '@/features/shop/hooks/useCartActions';
import { useWishlistActions } from '@/features/shop/hooks/useWishlistActions';
import { useWishlistPaginationState } from '@/features/shop/hooks/useWishlistPaginationState';
import {
  selectWishlistItems,
  useWishlistStore,
} from '@/stores/shop/wishlist.store';
import PageBreadcrumb from '@/shared/components/layout/PageBreadcrumb';
import { Button } from '@/shared/components/ui/button';

export default function WishlistPage() {
  const pageSize = 8;
  const hydrated = useWishlistStore((state) => state.hydrated);
  const wishlistItems = useWishlistStore(selectWishlistItems);
  const { clearWishlist, removeWishlist, isMutating } = useWishlistActions();
  const { addItem } = useCartActions();
  const { currentPage, setPage } = useWishlistPaginationState();

  const totalPages = Math.max(1, Math.ceil(wishlistItems.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, totalPages, setPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return wishlistItems.slice(startIndex, startIndex + pageSize);
  }, [wishlistItems, currentPage]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          className="mb-4 text-xs font-medium tracking-wide sm:text-sm"
          items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
              Wishlist
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Save your favorite picks and come back any time.
            </p>
          </div>

          {wishlistItems.length > 0 ? (
            <Button
              variant="outline"
              onClick={clearWishlist}
              disabled={isMutating}
            >
              Clear wishlist
            </Button>
          ) : null}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="border-border/70 bg-card/30 mt-8 rounded-2xl border p-10 text-center">
            <h2 className="text-foreground text-xl font-semibold">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Tap the heart on any product card to save it here.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/">Explore collections</Link>
            </Button>
          </div>
        ) : null}
      </section>

      {wishlistItems.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
            {paginatedItems.map((item) => {
              return (
                <ShopProductCard
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  image={item.image}
                  name={item.name}
                  brand={item.subtitle}
                  priceLabel={item.price}
                  originalPriceLabel={item.originalPrice}
                  badge={
                    item.badge
                      ? {
                          label: item.badge,
                          variant: 'default',
                        }
                      : undefined
                  }
                  discountPercentage={item.discountPercentage}
                  primaryAction={{
                    label: 'Add to Cart',
                    ariaLabel: `Add ${item.name} to cart`,
                    className: 'flex-1',
                    onClick: () => {
                      addItem({
                        variantId: item.variantId,
                        slug: item.slug,
                        name: item.name,
                        variantLabel: item.subtitle || 'Default',
                        unitPrice: Number(item.price.replace(/[^0-9.]/g, '')) || 0,
                        image: item.image,
                        quantity: 1,
                      });
                    },
                  }}
                  secondaryAction={{
                    ariaLabel: `Remove ${item.name} from wishlist`,
                    icon: <Trash2 className="size-5" />,
                    onClick: () => removeWishlist(item),
                    className: 'w-12 h-12 rounded-full',
                  }}
                />
              );
            })}
          </div>

          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      ) : null}
    </div>
  );
}
