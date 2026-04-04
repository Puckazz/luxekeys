import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ShopProductCardProps } from '@/features/shop/types/shop-product-card.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export default function ShopProductCard({
  href,
  image,
  name,
  viewMode = 'grid',
  brand,
  description,
  subtitle,
  tags,
  priceLabel,
  originalPriceLabel,
  badge,
  discountPercentage,
  wishlistToggle,
  primaryAction,
  secondaryAction,
}: ShopProductCardProps) {
  const isList = viewMode === 'list';

  const onActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    callback: () => void
  ) => {
    event.preventDefault();
    event.stopPropagation();
    callback();
  };

  return (
    <Card
      className={cn(
        'group hover:border-primary/40 hover:shadow-primary/10 relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        isList && 'flex flex-col md:flex-row'
      )}
    >
      <Link href={href} className="absolute inset-0 z-10" aria-label={name} />

      <div
        className={cn(
          'relative overflow-hidden',
          isList ? 'h-56 w-full md:h-auto md:w-64 lg:w-72' : 'aspect-square'
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes={
            isList
              ? '(max-width: 768px) 100vw, 320px'
              : '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {badge ? (
          <Badge className="absolute top-3 left-3" variant={badge.variant}>
            {badge.label}
          </Badge>
        ) : null}

        {discountPercentage ? (
          <Badge
            className="absolute top-3 right-3 font-black"
            variant="destructive"
          >
            -{discountPercentage}%
          </Badge>
        ) : null}
      </div>

      <CardContent className="flex-1">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            {brand ? (
              <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                {brand}
              </p>
            ) : null}
            <h3 className="text-foreground mt-1 text-xl font-bold tracking-tight">
              {name}
            </h3>
            {subtitle ? (
              <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-primary text-xl font-bold">{priceLabel}</p>
            {originalPriceLabel ? (
              <p className="text-muted-foreground text-xs line-through">
                {originalPriceLabel}
              </p>
            ) : null}
          </div>
        </div>

        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}

        {tags && tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="tag" className="rounded-md">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant={primaryAction.variant ?? 'secondary'}
            size={primaryAction.size ?? 'lg'}
            className={cn(
              'relative z-20 rounded-full px-4 py-6 font-semibold',
              primaryAction.className
            )}
            aria-label={primaryAction.ariaLabel}
            onClick={(event) => onActionClick(event, primaryAction.onClick)}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </Button>

          {wishlistToggle ? (
            <Button
              variant="outline"
              size="icon-lg"
              className="relative z-20 w-12 h-12 rounded-full"
              aria-label={wishlistToggle.ariaLabel}
              onClick={(event) => onActionClick(event, wishlistToggle.onClick)}
            >
              <Heart
                className={cn(
                  'size-5',
                  wishlistToggle.active && 'fill-current'
                )}
              />
            </Button>
          ) : null}

          {secondaryAction ? (
            <Button
              variant={secondaryAction.variant ?? 'outline'}
              size="icon-lg"
              className={cn('relative z-20', secondaryAction.className)}
              aria-label={secondaryAction.ariaLabel}
              onClick={(event) => onActionClick(event, secondaryAction.onClick)}
            >
              {secondaryAction.icon}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
