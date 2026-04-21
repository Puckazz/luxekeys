import {
  Prisma,
  Category as PrismaCategory,
} from '../../../generated/prisma/index.js';

export type CategoryWithChildren = PrismaCategory & {
  children?: CategoryWithChildren[];
  parent?: PrismaCategory | null;
  _count?: { products: number };
};

export const CATEGORY_DETAIL_INCLUDE = {
  parent: true,
  children: { where: { deletedAt: null }, orderBy: { name: 'asc' as const } },
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;

export const CATEGORY_LIST_INCLUDE = {
  parent: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;
