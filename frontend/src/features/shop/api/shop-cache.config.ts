export const SHOP_CACHE_REVALIDATE = {
  homepage: 300,
  productList: 60,
  productDetail: 300,
  featuredProducts: 300,
  brandOptions: 3_600,
} as const;

export const SHOP_CACHE_TAGS = {
  products: 'shop-products',
  productLists: 'shop-product-lists',
  productDetails: 'shop-product-details',
  featuredProducts: 'shop-featured-products',
  brandOptions: 'shop-brand-options',
  productDetail: (slug: string) => `shop-product:${slug}`,
} as const;
