import type { FeaturedProduct } from '@/features/shop/types';

export type ProductCollectionSectionProps = {
  title: string;
  description?: string;
  products: FeaturedProduct[];
  showControls: boolean;
  viewAllHref?: string;
  viewAllLabel: string;
  className?: string;
};
