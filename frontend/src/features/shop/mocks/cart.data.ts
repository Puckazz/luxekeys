import type { FeaturedProduct } from '@/features/shop/types';
import type { CartLineItem } from '@/features/shop/types/cart-page.types';

export const initialCartItems: CartLineItem[] = [
  {
    id: 'cart-1',
    slug: 'mk-90-pro',
    name: 'Premium Wireless Headphones',
    variantLabel: 'Matte Black',
    unitPrice: 299,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cart-2',
    slug: 'wuque-zoom75',
    name: 'Mechanical Gaming Keyboard',
    variantLabel: 'Tactile Switches, RGB',
    unitPrice: 149.5,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
  },
];

export const cartPricing = {
  shippingEstimate: 15,
  taxRate: 0.08,
};

export const youMightAlsoLikeProducts: FeaturedProduct[] = [
  {
    slug: 'charging-pad-x1',
    name: 'Fast Wireless Charging Pad',
    subtitle: '15W Qi-Certified',
    price: '$39.99',
    discountPercentage: 12,
    badge: null,
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'ergonomic-mouse-pro',
    name: 'Ergonomic Wireless Mouse',
    subtitle: 'Dark Grey',
    price: '$89.00',
    discountPercentage: 18,
    badge: null,
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'usb-c-hub-7in1',
    name: '7-in-1 USB-C Hub',
    subtitle: 'Aluminum',
    price: '$45.00',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'vegan-desk-mat',
    name: 'Premium Vegan Leather Desk Mat',
    subtitle: 'Midnight Black',
    price: '$35.00',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?auto=format&fit=crop&w=1200&q=80',
  },
];
