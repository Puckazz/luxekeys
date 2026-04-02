import type { FeaturedProduct } from '@/features/shop/types';

export type FeaturedCollectionsVariant = 'featured' | 'compact';

export type FeaturedCollectionsSectionProps = {
  title?: string;
  description?: string;
  products?: FeaturedProduct[];
  variant?: FeaturedCollectionsVariant;
  showControls?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
};
