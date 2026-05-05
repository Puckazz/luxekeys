import { Prisma } from '../../../generated/prisma/index.js';

export const CATEGORY_DETAIL_INCLUDE = {
  parent: true,
  children: { where: { deletedAt: null }, orderBy: { name: 'asc' as const } },
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;

export const CATEGORY_LIST_INCLUDE = {
  parent: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;

export const CATEGORY_TREE_INCLUDE = {
  children: {
    where: { deletedAt: null },
    orderBy: { name: 'asc' as const },
    include: {
      children: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' as const },
        include: { _count: { select: { products: true as const } } },
      },
      _count: { select: { products: true as const } },
    },
  },
  _count: { select: { products: true as const } },
} satisfies Prisma.CategoryInclude;

export type CategoryDetail = Prisma.CategoryGetPayload<{
  include: typeof CATEGORY_DETAIL_INCLUDE;
}>;

export type CategorySummary = Prisma.CategoryGetPayload<{
  include: typeof CATEGORY_LIST_INCLUDE;
}>;

export type CategoryTree = Prisma.CategoryGetPayload<{
  include: typeof CATEGORY_TREE_INCLUDE;
}>;
