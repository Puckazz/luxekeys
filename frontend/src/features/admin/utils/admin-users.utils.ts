import type {
  AdminUserListQueryState,
  AdminUserStatus,
} from '@/features/admin/types/admin-users.types';
import { canManageUsersCrud, type UserRole, USER_ROLES } from '@/lib/rbac';

export const adminUserRoleLabelByValue: Record<UserRole, string> = {
  admin: 'Admin',
  customer: 'Customer',
};

export const adminUserStatusLabelByValue: Record<AdminUserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  archived: 'Archived',
};

export const adminUserSortLabelByValue: Record<
  AdminUserListQueryState['sort'],
  string
> = {
  newest: 'Newest first',
  'name-asc': 'Name (A-Z)',
  'name-desc': 'Name (Z-A)',
  'email-asc': 'Email (A-Z)',
};

export const getAssignableUserRoles = (actorRole: UserRole): UserRole[] => {
  if (canManageUsersCrud(actorRole)) {
    return [...USER_ROLES];
  }

  return [];
};
