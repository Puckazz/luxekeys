export type CartLineItem = {
  id: string;
  slug: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
};

export type CartPageProps = {
  initialItems?: CartLineItem[];
};

export type AddCartItemInput = {
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
