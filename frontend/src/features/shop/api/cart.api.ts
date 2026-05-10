import { authFetch } from '@/shared/api/http-client';
import {
  mapCartResponseToSnapshot,
  type CartResponse,
} from '@/features/shop/mappers/cart-api/cart-api.mapper';
import type { FeaturedProduct } from '@/features/shop/types';
import type {
  CartSnapshot,
} from '@/features/shop/types/cart-page.types';

export const cartApi = {
  getCart: async (): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>('cart');
    return mapCartResponseToSnapshot(response);
  },

  syncCart: async (snapshot: CartSnapshot): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>('cart/sync', {
      method: 'POST',
      body: JSON.stringify({
        items: snapshot.items.map((item) => ({
          variantId: item.variantId,
          switchOptionId: item.switchOptionId,
          quantity: item.quantity,
        })),
      }),
    });

    return mapCartResponseToSnapshot(response);
  },

  getCartRecommendations: async (): Promise<FeaturedProduct[]> => {
    // This could be a real API endpoint in the future
    // For now, it could call a products API with some filtering
    return []; // Return empty for now or implement real recommendations
  },
};
