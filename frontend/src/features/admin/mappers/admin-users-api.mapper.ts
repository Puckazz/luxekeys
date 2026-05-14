import type {
  AdminUser,
  AdminUserApiItem,
  AdminUserApiPayload,
  AdminUserApiRole,
  AdminUserApiStatus,
  AdminUserApiSummary,
  AdminUserListQueryState,
  AdminUserStatus,
  AdminUserStatusSummary,
  UpsertAdminUserInput,
} from '@/features/admin/types/admin-users.types';
import type { UserRole } from '@/lib/rbac';

const apiRoleByUserRole: Record<UserRole, AdminUserApiRole> = {
  admin: 'ADMIN',
  customer: 'CUSTOMER',
};

const userRoleByApiRole: Record<AdminUserApiRole, UserRole> = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

const apiStatusByAdminStatus: Record<
  Exclude<AdminUserStatus, 'archived'>,
  AdminUserApiStatus
> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  suspended: 'SUSPENDED',
};

const adminStatusByApiStatus: Record<AdminUserApiStatus, AdminUserStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const userRoleToApiRole = (role: UserRole): AdminUserApiRole => {
  return apiRoleByUserRole[role];
};

export const userStatusToApiStatus = (
  status: Exclude<AdminUserStatus, 'archived'>
): AdminUserApiStatus => {
  return apiStatusByAdminStatus[status];
};

export const userStatusFilterToApiStatus = (
  status: AdminUserListQueryState['status']
): AdminUserApiStatus | 'ARCHIVED' | undefined => {
  if (status === 'all') {
    return undefined;
  }

  if (status === 'archived') {
    return 'ARCHIVED';
  }

  return userStatusToApiStatus(status);
};

export const userSortToApiParams = (
  sort: AdminUserListQueryState['sort']
): { sort: string } => {
  return { sort };
};

export const mapApiUserToAdminUser = (user: AdminUserApiItem): AdminUser => {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
    role: userRoleByApiRole[user.role],
    status: user.deletedAt ? 'archived' : adminStatusByApiStatus[user.status],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
};

export const mapApiUserSummary = (
  summary: AdminUserApiSummary
): AdminUserStatusSummary => {
  return {
    all: summary.all,
    active: summary.ACTIVE,
    inactive: summary.INACTIVE,
    suspended: summary.SUSPENDED,
    archived: summary.ARCHIVED,
  };
};

export const mapUpsertUserInputToPayload = (
  input: UpsertAdminUserInput
): AdminUserApiPayload => {
  return {
    email: input.email,
    fullName: input.name,
    phone: input.phone?.trim() || null,
    ...(input.password ? { password: input.password } : {}),
    role: userRoleToApiRole(input.role),
    status: userStatusToApiStatus(input.status),
  };
};
