import type { AdminCategory } from '@/features/admin/types';
import type {
  AdminCategoryApiItem,
  AdminCategoryApiPayload,
  AdminCategoryListQueryState,
  UpsertAdminCategoryInput,
} from '@/features/admin/types/admin-categories.types';

export const categorySortToApiParams = (
  sort: AdminCategoryListQueryState['sort']
): { sort: string } => {
  return {
    sort,
  };
};

export const mapApiCategoryToAdminCategory = (
  category: AdminCategoryApiItem
): AdminCategory => {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    productCount: category._count.products,
    status: category.deletedAt
      ? 'archived'
      : category.isActive
        ? 'active'
        : 'draft',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const mapUpsertCategoryInputToPayload = (
  input: UpsertAdminCategoryInput
): AdminCategoryApiPayload => {
  return {
    name: input.name,
    description: input.description,
    isActive: input.status === 'active',
  };
};
