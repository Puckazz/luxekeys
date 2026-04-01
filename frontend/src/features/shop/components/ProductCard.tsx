import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ProductCardBadge } from '@/features/shop/types';
import type { ProductCardProps } from '@/features/shop/types/product-list.types';

const badgeVariants: Record<
  ProductCardBadge,
  'default' | 'success' | 'warning'
> = {
  new: 'default',
  'in-stock': 'success',
  limited: 'warning',
};

const badgeLabel: Record<ProductCardBadge, string> = {
  new: 'New',
  'in-stock': 'In Stock',
  limited: 'Limited',
};

const toCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const isList = viewMode === 'list';

  return (
    <Card
      className={cn(
        'group hover:border-primary/40 hover:shadow-primary/10 relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        isList && 'flex flex-col md:flex-row'
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Open details for ${product.name}`}
      />

      <div
        className={cn(
          'relative overflow-hidden',
          isList ? 'h-56 w-full md:h-auto md:w-64 lg:w-72' : 'aspect-square'
        )}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={
            isList
              ? '(max-width: 768px) 100vw, 320px'
              : '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <Badge
            className="absolute top-3 left-3"
            variant={badgeVariants[product.badge]}
          >
            {badgeLabel[product.badge]}
          </Badge>
        ) : null}
      </div>

      <CardContent className="flex-1">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">
              {product.brand}
            </p>
            <h3 className="text-foreground mt-1 text-xl font-bold tracking-tight">
              {product.name}
            </h3>
          </div>
          <p className="text-foreground text-xl font-bold">
            {toCurrency(product.price)}
          </p>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="tag" className="rounded-md">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          {/* <p className="text-muted-foreground text-xs">
            {product.layout} · {product.switchType} ·{' '}
            {product.rating.toFixed(1)} rating
          </p> */}
          <Button
            variant="secondary"
            size="lg"
            className="relative z-20 w-full rounded-full px-4 py-6 font-semibold"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
