import { Prisma } from '../../../generated/prisma/index.js';

export const BRAND_DETAIL_INCLUDE = {
  _count: { select: { products: true } },
} satisfies Prisma.BrandInclude;

export const BRAND_LIST_INCLUDE = {
  _count: { select: { products: true } },
} satisfies Prisma.BrandInclude;

export type BrandDetail = Prisma.BrandGetPayload<{
  include: typeof BRAND_DETAIL_INCLUDE;
}>;

export type BrandSummary = Prisma.BrandGetPayload<{
  include: typeof BRAND_LIST_INCLUDE;
}>;
