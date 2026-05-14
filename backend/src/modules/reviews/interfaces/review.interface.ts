import { Prisma } from '../../../generated/prisma/index.js';

export const REVIEW_DETAIL_INCLUDE = {
  user: { select: { id: true, fullName: true, avatarUrl: true } },
  product: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
} satisfies Prisma.ReviewInclude;

export const REVIEW_LIST_INCLUDE = {
  user: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.ReviewInclude;

export const ADMIN_REVIEW_INCLUDE = {
  user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
  product: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewDetail = Prisma.ReviewGetPayload<{
  include: typeof REVIEW_DETAIL_INCLUDE;
}>;

export type ReviewSummary = Prisma.ReviewGetPayload<{
  include: typeof REVIEW_LIST_INCLUDE;
}>;

export type AdminReviewRecord = Prisma.ReviewGetPayload<{
  include: typeof ADMIN_REVIEW_INCLUDE;
}>;
