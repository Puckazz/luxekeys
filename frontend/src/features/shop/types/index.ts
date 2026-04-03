export interface FeaturedProduct {
  slug: string;
  name: string;
  subtitle: string;
  price: string;
  discountPercentage?: number;
  badge: string | null;
  image: string;
}

export interface CountdownItem {
  value: string;
  label: string;
}

export interface CommunityImage {
  image: string;
  alt: string;
  cols?: 1 | 2;
  rows?: 1 | 2;
}

export interface LabNote {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

export type ProductLayout = '60%' | '65%' | '75%' | 'TKL' | '100%' | 'Split';

export type ProductSwitchType = 'Linear' | 'Tactile' | 'Clicky';

export type ProductFeature =
  | 'Hotswap PCB'
  | 'RGB Lighting'
  | 'QMK/VIA Support'
  | 'Wireless'
  | 'Low Profile'
  | 'LCD Screen'
  | 'LED Matrix';

export type ProductCaseMaterial =
  | 'Aluminum'
  | 'Polycarbonate'
  | 'ABS Plastic'
  | 'Carbon Fiber';

export type ProductCardBadge = 'new' | 'in-stock' | 'limited';

export type ProductSortOption = 'popularity' | 'newest' | 'rating' | 'price';

export type ProductListViewMode = 'grid' | 'list';

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  discountPercentage?: number;
  image: string;
  badge?: ProductCardBadge;
  layout: ProductLayout;
  switchType: ProductSwitchType;
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial;
  tags: string[];
  rating: number;
  popularity: number;
  createdAt: string;
}

export interface ProductListQueryState {
  layouts: ProductLayout[];
  switchTypes: ProductSwitchType[];
  features: ProductFeature[];
  caseMaterial: ProductCaseMaterial | 'All';
  price: {
    min: number;
    max: number;
  };
  sort: ProductSortOption;
  page: number;
}

export interface ProductPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductListApiResponse {
  items: ProductListItem[];
  meta: ProductPaginationMeta;
  priceBounds: {
    min: number;
    max: number;
  };
}

export type ProductStockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface ProductGalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface ProductDetailSpec {
  id: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface ProductMaterialSample {
  id: string;
  name: string;
  image: string;
}

export interface ProductMaterialShowcase {
  eyebrow: string;
  title: string;
  description: string;
  samples: ProductMaterialSample[];
  architectureImage: string;
  architectureTitle: string;
  architectureDescription: string;
}

export interface ProductVideoTour {
  title: string;
  description: string;
  durationLabel: string;
  coverImage: string;
}

export interface ProductReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAtLabel: string;
  helpfulCount: number;
}

export interface ProductDetail extends ProductListItem {
  series: string;
  stockStatus: ProductStockStatus;
  stockLabel: string;
  reviewCount: number;
  gallery: ProductGalleryImage[];
  switchOptions: ProductSwitchType[];
  colorOptions: string[];
  defaultSwitch: ProductSwitchType;
  defaultColor: string;
  quantityLimit: number;
  specsHeading: string;
  specsDescription: string;
  technicalSpecs: ProductDetailSpec[];
  materialShowcase: ProductMaterialShowcase;
  videoTour: ProductVideoTour;
  reviewsHeading: string;
  reviews: ProductReviewItem[];
}

export type {
  CheckoutConfirmationData,
  CheckoutDraft,
  CheckoutFormValues,
  CheckoutOrderSummaryCardProps,
  CheckoutPaymentMethodOption,
  CheckoutPricingBreakdown,
  CheckoutReviewData,
  CheckoutShippingOption,
  CheckoutStepKey,
  CheckoutStepperProps,
  PaymentMethodId,
  ShippingAddress,
  ShippingMethodId,
} from '@/features/shop/types/checkout.types';
