import type { CartSnapshot } from '@/features/shop/types/cart-page.types';

export interface CartItemResponse {
  id: string;
  variantId: string;
  switchOptionId?: string | null;
  quantity: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number | string;
    product: {
      id: string;
      name: string;
      slug: string;
      thumbnailUrl: string | null;
    };
  };
  switchOption?: {
    id: string;
    name: string;
    switchType: string;
    price?: number | string;
    compareAtPrice?: number | string | null;
  } | null;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number | string;
  updatedAt: string | Date;
}

export const mapCartResponseToSnapshot = (
  response: CartResponse
): CartSnapshot => {
  return {
    items: response.items.map((item) => {
      const variantLabel = item.switchOption
        ? `${item.variant.name} / ${item.switchOption.name}`
        : item.variant.name;

      return {
        id: item.switchOptionId
          ? `${item.variantId}::${item.switchOptionId}`
          : item.variantId,
        cartItemId: item.id,
        variantId: item.variantId,
        switchOptionId: item.switchOptionId,
        slug: item.variant.product.slug,
        name: item.variant.product.name,
        variantLabel,
        unitPrice: Number(item.switchOption?.price ?? item.variant.price),
        quantity: item.quantity,
        image: item.variant.product.thumbnailUrl ?? '',
      };
    }),
    updatedAt: new Date(response.updatedAt).getTime(),
  };
};
