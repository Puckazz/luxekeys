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
    price: number | string;
    compareAtPrice?: number | string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithTotals extends CartItemResponse {
  subtotal: number | string;
}
