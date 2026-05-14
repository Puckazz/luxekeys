import type { AdminBrand } from '@/features/admin/types';
import type {
  AdminBrandApiItem,
  AdminBrandApiPayload,
  AdminBrandListQueryState,
  UpsertAdminBrandInput,
} from '@/features/admin/types/admin-brands.types';

export const brandSortToApiParams = (
  sort: AdminBrandListQueryState['sort']
): { sort: string } => {
  return {
    sort,
  };
};

export const mapApiBrandToAdminBrand = (
  brand: AdminBrandApiItem
): AdminBrand => {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl ?? undefined,
    productCount: brand._count.products,
    status: brand.deletedAt ? 'archived' : brand.isActive ? 'active' : 'draft',
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
};

export const mapUpsertBrandInputToPayload = (
  input: UpsertAdminBrandInput
): AdminBrandApiPayload => {
  return {
    name: input.name,
    logoUrl: input.logoUrl || undefined,
    isActive: input.status === 'active',
  };
};
