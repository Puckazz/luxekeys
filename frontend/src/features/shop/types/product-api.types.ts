import type {
  ProductCategory,
  ProductListApiResponse,
  ProductListQueryState,
} from '@/features/shop/types';
import type { ProductBrandOptionItem } from '@/features/shop/types/product-list.types';

export type CustomerProductApiType =
  | 'KEYBOARD'
  | 'SWITCH'
  | 'KEYCAP'
  | 'ACCESSORY'
  | 'BAREBONES_KIT';

export type CustomerProductApiStatus = 'ACTIVE' | 'INACTIVE';

export type CustomerProductBrandApiItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type CustomerProductCategoryApiItem = {
  id: string;
  name: string;
  slug: string;
};

export type CustomerProductImageApiItem = {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  cloudinaryPublicId?: string | null;
};

export type CustomerProductSpecApiItem = {
  id: string;
  productId: string;
  specKey: string;
  specValue: string;
  groupName?: string | null;
  sortOrder: number;
  createdAt: string;
};

export type CustomerProductSwitchOptionApiItem = {
  id: string;
  variantId: string;
  name: string;
  switchType: string;
  stock: number;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
};

export type CustomerProductVariantApiItem = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  color?: string | null;
  layout?: string | null;
  connectivity?: string | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  switchOptions?: CustomerProductSwitchOptionApiItem[];
};

export type CustomerProductCountApiItem = {
  reviews?: number;
  wishlistItems?: number;
};

export type CustomerProductSummaryApiItem = {
  id: string;
  name: string;
  slug: string;
  averageRating?: number;
  shortDescription?: string | null;
  description?: string | null;
  type: CustomerProductApiType;
  status: CustomerProductApiStatus;
  brandId?: string | null;
  categoryId?: string | null;
  basePrice: string | number;
  compareAtPrice?: string | number | null;
  thumbnailUrl?: string | null;
  tags?: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  brand?: CustomerProductBrandApiItem | null;
  category?: CustomerProductCategoryApiItem | null;
  images?: CustomerProductImageApiItem[];
  variants?: CustomerProductVariantApiItem[];
  _count?: CustomerProductCountApiItem;
};

export type CustomerProductDetailApiItem = CustomerProductSummaryApiItem & {
  specs?: CustomerProductSpecApiItem[];
};

export type CustomerReviewApiItem = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  } | null;
};

export type CustomerProductApiPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CustomerProductApiPriceBounds = {
  min: number;
  max: number;
};

export type CustomerProductListApiData = {
  items: CustomerProductSummaryApiItem[];
  priceBounds: CustomerProductApiPriceBounds;
};

export type ProductApiQueryParams = {
  type?: string;
  status: CustomerProductApiStatus;
  brandId?: string;
  categorySlug?: string;
  layout?: string;
  switchType?: string;
  search?: string;
  minPrice: number;
  maxPrice: number;
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'basePrice';
  sortOrder: 'asc' | 'desc';
};

export type ProductApiCategoryMap = Record<
  ProductCategory,
  CustomerProductApiType
>;

export type ProductApiAdapter = {
  getProducts: (
    queryState: ProductListQueryState
  ) => Promise<ProductListApiResponse>;
  getBrandOptions: () => Promise<ProductBrandOptionItem[]>;
};
