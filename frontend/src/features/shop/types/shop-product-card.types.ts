import type { ReactNode } from 'react';

import type { ProductListViewMode } from '@/features/shop/types';

export type ShopProductCardBadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive';

export type ShopProductCardAction = {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'lg';
  className?: string;
};

export type ShopProductCardIconAction = {
  ariaLabel: string;
  onClick: () => void;
  icon: ReactNode;
  variant?: 'secondary' | 'outline';
  className?: string;
};

export type ShopProductCardProps = {
  href: string;
  image: string;
  name: string;
  viewMode?: ProductListViewMode;
  brand?: string;
  description?: string;
  subtitle?: string;
  tags?: string[];
  priceLabel: string;
  originalPriceLabel?: string;
  badge?: {
    label: string;
    variant: ShopProductCardBadgeVariant;
  };
  discountPercentage?: number;
  wishlistToggle?: {
    active: boolean;
    ariaLabel: string;
    onClick: () => void;
  };
  primaryAction: ShopProductCardAction;
  secondaryAction?: ShopProductCardIconAction;
};
