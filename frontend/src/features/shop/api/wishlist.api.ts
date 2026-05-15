import {
  mapWishlistItemToFeaturedProduct,
  type WishlistApiItem,
} from '@/features/shop/mappers/wishlist-api.mapper';
import type { FeaturedProduct } from '@/features/shop/types';
import { authFetch } from '@/shared/api/http-client';

export const wishlistApi = {
  getWishlist: async (): Promise<FeaturedProduct[]> => {
    const items = await authFetch<WishlistApiItem[]>('wishlist', {
      cache: 'no-store',
    });

    return items.map(mapWishlistItemToFeaturedProduct);
  },

  addItem: async (productId: string): Promise<FeaturedProduct> => {
    const item = await authFetch<WishlistApiItem>('wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });

    return mapWishlistItemToFeaturedProduct(item);
  },

  removeItem: async (productId: string): Promise<{ removed: boolean }> => {
    return authFetch<{ removed: boolean }>(`wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};
