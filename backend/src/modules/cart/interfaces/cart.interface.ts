export interface CartItemResponse {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number | string;
    product: {
      id: string;
      name: string;
      thumbnailUrl: string | null;
    };
  };
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
