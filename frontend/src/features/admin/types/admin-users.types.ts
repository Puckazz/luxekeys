import type { UserRole } from '@/lib/rbac';

export const ADMIN_USER_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'archived',
] as const;

export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export const ADMIN_USER_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'name-desc',
  'email-asc',
] as const;

export type AdminUserSortOption = (typeof ADMIN_USER_SORT_OPTIONS)[number];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface AdminUserPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminUserListApiResponse {
  items: AdminUser[];
  meta: AdminUserPaginationMeta;
}

export interface AdminUserListQueryState {
  search: string;
  role: UserRole | 'all';
  status: AdminUserStatus | 'all';
  sort: AdminUserSortOption;
  page: number;
  pageSize: number;
}

export interface UpdateAdminUserRoleInput {
  actorRole: UserRole;
  nextRole: UserRole;
  userId: string;
}

export interface AdminUserFormValues {
  name: string;
  email: string;
  role: UserRole;
  status: Exclude<AdminUserStatus, 'archived'>;
}

export interface UpsertAdminUserInput {
  actorRole: UserRole;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: Exclude<AdminUserStatus, 'archived'>;
}

export interface ArchiveAdminUserInput {
  actorRole: UserRole;
  userId: string;
}

export interface RestoreAdminUserInput {
  actorRole: UserRole;
  userId: string;
}
