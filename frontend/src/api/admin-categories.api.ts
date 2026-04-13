import type {
  AdminCategory,
  AdminCategoryListApiResponse,
  AdminCategoryStatus,
} from '@/features/admin/types';
import type {
  AdminCategoryListResponse,
  AdminCategoryListQueryState,
  AdminCategoryStatusSummary,
  UpsertAdminCategoryInput,
} from '@/features/admin/types/admin-categories.types';
import { createSeedCategories } from '@/api/mocks/admin-categories.mock';

const MOCK_NETWORK_DELAY = 160;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createId = (prefix: string) => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

const nowIso = () => {
  return new Date().toISOString();
};

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const sortCategories = (
  categories: AdminCategory[],
  sort: AdminCategoryListQueryState['sort']
) => {
  const next = [...categories];

  if (sort === 'name-asc') {
    next.sort((left, right) => left.name.localeCompare(right.name));
    return next;
  }

  if (sort === 'products-desc') {
    next.sort((left, right) => right.productCount - left.productCount);
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return next;
};

let categoriesStore: AdminCategory[] = createSeedCategories();

const filterByStatus = (
  categories: AdminCategory[],
  status: AdminCategoryStatus | 'all'
) => {
  if (status === 'all') {
    return categories;
  }

  return categories.filter((category) => category.status === status);
};

const filterBySearch = (categories: AdminCategory[], search: string) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return categories;
  }

  return categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(normalizedSearch) ||
      category.slug.toLowerCase().includes(normalizedSearch) ||
      category.description.toLowerCase().includes(normalizedSearch)
    );
  });
};

const paginate = (
  categories: AdminCategory[],
  page: number,
  pageSize: number
): AdminCategoryListApiResponse => {
  const totalItems = categories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: categories.slice(start, end),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

const buildCategoryStatusSummary = (
  categories: AdminCategory[]
): AdminCategoryStatusSummary => {
  const initialSummary: AdminCategoryStatusSummary = {
    all: categories.length,
    active: 0,
    draft: 0,
    archived: 0,
  };

  return categories.reduce((summary, category) => {
    summary[category.status] += 1;
    return summary;
  }, initialSummary);
};

export const adminCategoriesApi = {
  getCategories: async (
    queryState: AdminCategoryListQueryState
  ): Promise<AdminCategoryListResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const withoutArchived = categoriesStore.filter(
      (category) =>
        queryState.status === 'archived' || category.status !== 'archived'
    );

    const withSearch = filterBySearch(withoutArchived, queryState.search);
    const summary = buildCategoryStatusSummary(withSearch);
    const withStatus = filterByStatus(withSearch, queryState.status);
    const sorted = sortCategories(withStatus, queryState.sort);
    const paginated = paginate(sorted, queryState.page, queryState.pageSize);

    return {
      ...paginated,
      summary,
    };
  },

  createCategory: async (
    input: UpsertAdminCategoryInput
  ): Promise<AdminCategory> => {
    await delay(MOCK_NETWORK_DELAY);

    const timestamp = nowIso();

    const category: AdminCategory = {
      id: createId('category'),
      name: input.name,
      slug: toSlug(input.name),
      description: input.description,
      productCount: 0,
      status: input.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    categoriesStore = [category, ...categoriesStore];

    return category;
  },

  updateCategory: async (
    input: UpsertAdminCategoryInput
  ): Promise<AdminCategory> => {
    await delay(MOCK_NETWORK_DELAY);

    if (!input.id) {
      throw new Error('Category id is required for update.');
    }

    const existingCategory = categoriesStore.find(
      (category) => category.id === input.id
    );

    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    const updatedCategory: AdminCategory = {
      ...existingCategory,
      name: input.name,
      slug: toSlug(input.name),
      description: input.description,
      status: input.status,
      updatedAt: nowIso(),
    };

    categoriesStore = categoriesStore.map((category) => {
      return category.id === updatedCategory.id ? updatedCategory : category;
    });

    return updatedCategory;
  },

  softDeleteCategory: async (categoryId: string): Promise<AdminCategory> => {
    await delay(MOCK_NETWORK_DELAY);

    const existingCategory = categoriesStore.find(
      (category) => category.id === categoryId
    );

    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    const archivedCategory: AdminCategory = {
      ...existingCategory,
      status: 'archived',
      updatedAt: nowIso(),
    };

    categoriesStore = categoriesStore.map((category) => {
      return category.id === categoryId ? archivedCategory : category;
    });

    return archivedCategory;
  },

  restoreCategory: async (categoryId: string): Promise<AdminCategory> => {
    await delay(MOCK_NETWORK_DELAY);

    const existingCategory = categoriesStore.find(
      (category) => category.id === categoryId
    );

    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    const restoredCategory: AdminCategory = {
      ...existingCategory,
      status: 'draft',
      updatedAt: nowIso(),
    };

    categoriesStore = categoriesStore.map((category) => {
      return category.id === categoryId ? restoredCategory : category;
    });

    return restoredCategory;
  },
};
