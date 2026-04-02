import { initialCartItems } from '@/features/shop/mocks/cart.data';
import type {
  CartLineItem,
  CartSnapshot,
} from '@/features/shop/types/cart-page.types';

const MOCK_DELAY = 180;
const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const cloneItems = (items: CartLineItem[]) => {
  return items.map((item) => ({ ...item }));
};

let serverCartState: CartSnapshot = {
  items: cloneItems(initialCartItems),
  updatedAt: Date.now(),
};

export const cartApi = {
  getCart: async (): Promise<CartSnapshot> => {
    await delay(MOCK_DELAY);

    return {
      items: cloneItems(serverCartState.items),
      updatedAt: serverCartState.updatedAt,
    };
  },

  syncCart: async (snapshot: CartSnapshot): Promise<CartSnapshot> => {
    await delay(MOCK_DELAY);

    serverCartState = {
      items: snapshot.items
        .filter((item) => item.quantity > 0)
        .map((item) => ({ ...item, quantity: Math.max(1, item.quantity) })),
      updatedAt: Date.now(),
    };

    return {
      items: cloneItems(serverCartState.items),
      updatedAt: serverCartState.updatedAt,
    };
  },
};
