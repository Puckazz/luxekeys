import { Prisma } from '../../../generated/prisma/index.js';

export const WISHLIST_ITEM_INCLUDE = {
  product: {
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isDefault: true, deletedAt: null, isActive: true },
        take: 1,
      },
    },
  },
} satisfies Prisma.WishlistItemInclude;

export type WishlistItemDetail = Prisma.WishlistItemGetPayload<{
  include: typeof WISHLIST_ITEM_INCLUDE;
}>;
