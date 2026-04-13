import type {
  AdminReview,
  AdminReviewDetail,
  AdminReviewListApiResponse,
  AdminReviewListQueryState,
  AdminReviewStatusSummary,
  BulkUpdateAdminReviewStatusInput,
  BulkUpdateAdminReviewStatusResponse,
  UpdateAdminReviewStatusInput,
} from '@/features/admin/types/admin-reviews.types';
import { createSeedReviews } from '@/api/mocks/admin-reviews.mock';

const MOCK_NETWORK_DELAY = 160;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let reviewsStore: AdminReviewDetail[] = createSeedReviews();

const normalizeSearchTerm = (value: string) => {
  return value.trim().toLowerCase();
};

const filterBySearch = (reviews: AdminReviewDetail[], search: string) => {
  const normalizedSearch = normalizeSearchTerm(search);

  if (!normalizedSearch) {
    return reviews;
  }

  return reviews.filter((review) => {
    return (
      normalizeSearchTerm(review.productName).includes(normalizedSearch) ||
      normalizeSearchTerm(review.reviewerName).includes(normalizedSearch) ||
      normalizeSearchTerm(review.reviewerEmail).includes(normalizedSearch) ||
      normalizeSearchTerm(review.title).includes(normalizedSearch) ||
      normalizeSearchTerm(review.content).includes(normalizedSearch)
    );
  });
};

const filterByStatus = (
  reviews: AdminReviewDetail[],
  status: AdminReviewListQueryState['status']
) => {
  if (status === 'all') {
    return reviews;
  }

  return reviews.filter((review) => review.status === status);
};

const sortReviews = (
  reviews: AdminReviewDetail[],
  sort: AdminReviewListQueryState['sort']
) => {
  const next = [...reviews];

  if (sort === 'oldest') {
    next.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
    return next;
  }

  if (sort === 'rating-desc') {
    next.sort((left, right) => right.rating - left.rating);
    return next;
  }

  if (sort === 'rating-asc') {
    next.sort((left, right) => left.rating - right.rating);
    return next;
  }

  if (sort === 'helpful-desc') {
    next.sort((left, right) => right.helpfulCount - left.helpfulCount);
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return next;
};

const paginate = (
  reviews: AdminReviewDetail[],
  page: number,
  pageSize: number
): Pick<AdminReviewListApiResponse, 'items' | 'meta'> => {
  const totalItems = reviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: reviews.slice(start, end).map(toReviewListItem),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

const buildStatusSummary = (
  reviews: AdminReviewDetail[]
): AdminReviewStatusSummary => {
  const initialSummary: AdminReviewStatusSummary = {
    all: reviews.length,
    published: 0,
    pending: 0,
    hidden: 0,
    rejected: 0,
  };

  return reviews.reduce((summary, review) => {
    summary[review.status] += 1;
    return summary;
  }, initialSummary);
};

const toReviewListItem = (review: AdminReviewDetail): AdminReview => {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.productName,
    productImage: review.productImage,
    reviewerName: review.reviewerName,
    reviewerEmail: review.reviewerEmail,
    title: review.title,
    content: review.content,
    rating: review.rating,
    helpfulCount: review.helpfulCount,
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};

export const adminReviewsApi = {
  getReviews: async (
    queryState: AdminReviewListQueryState
  ): Promise<AdminReviewListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const withSearch = filterBySearch(reviewsStore, queryState.search);
    const summary = buildStatusSummary(withSearch);
    const withStatus = filterByStatus(withSearch, queryState.status);
    const sorted = sortReviews(withStatus, queryState.sort);
    const paginated = paginate(sorted, queryState.page, queryState.pageSize);

    return {
      ...paginated,
      summary,
    };
  },

  getReviewDetail: async (reviewId: string): Promise<AdminReviewDetail> => {
    await delay(MOCK_NETWORK_DELAY);

    const review = reviewsStore.find((item) => item.id === reviewId);

    if (!review) {
      throw new Error('Review not found.');
    }

    return review;
  },

  updateReviewStatus: async (
    input: UpdateAdminReviewStatusInput
  ): Promise<AdminReview> => {
    await delay(MOCK_NETWORK_DELAY);

    const review = reviewsStore.find((item) => item.id === input.reviewId);

    if (!review) {
      throw new Error('Review not found.');
    }

    review.status = input.status;
    review.updatedAt = new Date().toISOString();

    return toReviewListItem(review);
  },

  bulkUpdateReviewStatus: async (
    input: BulkUpdateAdminReviewStatusInput
  ): Promise<BulkUpdateAdminReviewStatusResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const targetReviewIds = new Set(input.reviewIds);
    const now = new Date().toISOString();

    let updatedCount = 0;

    reviewsStore = reviewsStore.map((review) => {
      if (!targetReviewIds.has(review.id)) {
        return review;
      }

      updatedCount += 1;

      return {
        ...review,
        status: input.status,
        updatedAt: now,
      };
    });

    return {
      updatedCount,
    };
  },
};
