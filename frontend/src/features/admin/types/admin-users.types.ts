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
  phone: string;
  role: UserRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
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
  summary: AdminUserStatusSummary;
}

export type AdminUserStatusSummary = Record<AdminUserStatus | 'all', number>;

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
  phone: string;
  password: string;
  role: UserRole;
  status: Exclude<AdminUserStatus, 'archived'>;
}

export interface UpsertAdminUserInput {
  actorRole: UserRole;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
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

export type AdminUserApiRole = 'ADMIN' | 'CUSTOMER';

export type AdminUserApiStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type AdminUserApiStatusFilter = AdminUserApiStatus | 'ARCHIVED';

export type AdminUserApiSummary = Record<
  'all' | AdminUserApiStatus | 'ARCHIVED',
  number
>;

export type AdminUserApiItem = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: AdminUserApiRole;
  status: AdminUserApiStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type AdminUserListApiData = {
  items: AdminUserApiItem[];
  summary: AdminUserApiSummary;
};

export type AdminUserApiPayload = {
  email: string;
  fullName: string;
  phone?: string | null;
  password?: string;
  role: AdminUserApiRole;
  status: AdminUserApiStatus;
};
