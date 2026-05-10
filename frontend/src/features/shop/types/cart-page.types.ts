export type CartLineItem = {
  id: string; // Composite ID: variantId + switchOptionId
  variantId: string;
  switchOptionId?: string | null;
  slug: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
};

export type AddCartItemInput = {
  variantId: string;
  switchOptionId?: string | null;
  slug: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  image: string;
  quantity?: number;
};

export type CartSnapshot = {
  items: CartLineItem[];
  updatedAt: number;
};
