import { ProductStatus, ProductType } from '../../../generated/prisma';

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  type: ProductType;
  status: ProductStatus;
  brandId?: string;
  categoryId?: string;
  basePrice: number;
  compareAtPrice?: number;
  thumbnailUrl?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
