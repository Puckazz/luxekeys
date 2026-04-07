import type { VariantProps } from 'class-variance-authority';

import type { AdminCategoryStatus } from '@/features/admin/types';
import type { AdminCategorySortOption } from '@/features/admin/types/admin-categories.types';
import type { badgeVariants } from '@/shared/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const adminCategoryStatusLabelByValue: Record<
  AdminCategoryStatus,
  string
> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export const adminCategoryStatusBadgeByValue: Record<
  AdminCategoryStatus,
  BadgeVariant
> = {
  active: 'success',
  draft: 'warning',
  archived: 'destructive',
};

export const adminCategorySortLabelByValue: Record<
  AdminCategorySortOption,
  string
> = {
  newest: 'Newest',
  'name-asc': 'Name (A-Z)',
  'products-desc': 'Products (high-low)',
};

export const formatRelativeDate = (value: string) => {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};
