import { Prisma } from '../../../generated/prisma/index.js';

export const PRODUCT_DETAIL_INCLUDE = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  specs: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null, isActive: true },
    orderBy: { isDefault: 'desc' as const },
  },
  _count: { select: { reviews: true, wishlistItems: true } },
} satisfies Prisma.ProductInclude;

export const PRODUCT_LIST_INCLUDE = {
  brand: true,
  category: true,
  images: { where: { isPrimary: true }, take: 1 },
  variants: {
    where: { isDefault: true, deletedAt: null, isActive: true },
    take: 1,
  },
  _count: { select: { reviews: true } },
} satisfies Prisma.ProductInclude;

export const PRODUCT_REVIEW_INCLUDE = {
  user: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.ReviewInclude;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_DETAIL_INCLUDE;
}>;

export type ProductSummary = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_INCLUDE;
}>;

export type ProductReview = Prisma.ReviewGetPayload<{
  include: typeof PRODUCT_REVIEW_INCLUDE;
}>;
