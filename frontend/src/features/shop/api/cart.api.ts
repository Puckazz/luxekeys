import { authFetch } from '@/shared/api/http-client';
import {
  mapCartResponseToSnapshot,
  type CartResponse,
} from '@/features/shop/mappers/cart-api/cart-api.mapper';
import type { FeaturedProduct } from '@/features/shop/types';
import type {
  AddCartItemInput,
  CartSnapshot,
} from '@/features/shop/types/cart-page.types';

export const cartApi = {
  getCart: async (): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>('cart', {
      cache: 'no-store',
    });
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

  addItem: async (input: AddCartItemInput): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>('cart/items', {
      method: 'POST',
      body: JSON.stringify({
        variantId: input.variantId,
        switchOptionId: input.switchOptionId,
        quantity: input.quantity ?? 1,
      }),
    });

    return mapCartResponseToSnapshot(response);
  },

  updateItem: async (
    cartItemId: string,
    quantity: number
  ): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>(`cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity,
      }),
    });

    return mapCartResponseToSnapshot(response);
  },

  removeItem: async (cartItemId: string): Promise<CartSnapshot> => {
    const response = await authFetch<CartResponse>(`cart/items/${cartItemId}`, {
      method: 'DELETE',
    });

    return mapCartResponseToSnapshot(response);
  },

  clearCart: async (): Promise<{ cleared: boolean }> => {
    return authFetch<{ cleared: boolean }>('cart', {
      method: 'DELETE',
    });
  },

  getCartRecommendations: async (): Promise<FeaturedProduct[]> => {
    // This could be a real API endpoint in the future
    // For now, it could call a products API with some filtering
    return []; // Return empty for now or implement real recommendations
  },
};
