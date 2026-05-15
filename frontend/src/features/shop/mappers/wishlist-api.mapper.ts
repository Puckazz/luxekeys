import { mapApiProductToFeaturedProduct } from '@/features/shop/mappers/product-api';
import type { FeaturedProduct } from '@/features/shop/types';
import type { CustomerProductSummaryApiItem } from '@/features/shop/types/product-api.types';

export type WishlistApiItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: CustomerProductSummaryApiItem;
};

export const mapWishlistItemToFeaturedProduct = (
  item: WishlistApiItem
): FeaturedProduct => {
  return mapApiProductToFeaturedProduct(item.product);
};
