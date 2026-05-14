import type { VariantProps } from 'class-variance-authority';

import type { AdminBrandStatus } from '@/features/admin/types';
import type { AdminBrandSortOption } from '@/features/admin/types/admin-brands.types';
import type { badgeVariants } from '@/shared/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const adminBrandStatusLabelByValue: Record<AdminBrandStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export const adminBrandStatusBadgeByValue: Record<
  AdminBrandStatus,
  BadgeVariant
> = {
  active: 'success',
  draft: 'warning',
  archived: 'destructive',
};

export const adminBrandSortLabelByValue: Record<
  AdminBrandSortOption,
  string
> = {
  newest: 'Newest',
  'name-asc': 'Name (A-Z)',
  'products-desc': 'Products (high-low)',
};

export const formatBrandRelativeDate = (value: string) => {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};
