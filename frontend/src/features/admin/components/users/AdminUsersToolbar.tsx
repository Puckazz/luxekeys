'use client';

import {
  AdminDebouncedSearchInput,
  AdminQuickStatusTabs,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import {
  ADMIN_USER_STATUSES,
  type AdminUserListQueryState,
  type AdminUserStatusSummary,
} from '@/features/admin/types/admin-users.types';
import {
  adminUserRoleLabelByValue,
  adminUserSortLabelByValue,
  adminUserStatusLabelByValue,
} from '@/features/admin/utils/admin-users.utils';
import { canManageUsersCrud, USER_ROLES, type UserRole } from '@/lib/rbac';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminUsersToolbarProps = {
  actorRole: UserRole;
  queryState: AdminUserListQueryState;
  summary?: AdminUserStatusSummary;
  onSearchChange: (search: string) => void;
  onRoleChange: (role: AdminUserListQueryState['role']) => void;
  onStatusChange: (status: AdminUserListQueryState['status']) => void;
  onSortChange: (sort: AdminUserListQueryState['sort']) => void;
  onCreateClick: () => void;
};

const statusQuickFilters: AdminUserListQueryState['status'][] = [
  'all',
  ...ADMIN_USER_STATUSES,
];

const userStatusFilterLabelByValue: Record<
  AdminUserListQueryState['status'],
  string
> = {
  all: 'All',
  ...adminUserStatusLabelByValue,
};

export function AdminUsersToolbar({
  actorRole,
  queryState,
  summary,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminUsersToolbarProps) {
  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="User management"
        description="Manage admin, staff, and customer accounts with role-based access control."
        actions={
          canManageUsersCrud(actorRole) ? (
            <Button type="button" size="lg" onClick={onCreateClick}>
              Add User
            </Button>
          ) : null
        }
      />

      <AdminQuickStatusTabs
        value={queryState.status}
        options={statusQuickFilters}
        labelByValue={userStatusFilterLabelByValue}
        summary={summary}
        onValueChange={(status) => onStatusChange(status)}
      />

      <AdminToolbarFiltersPanel
        searchSlot={
          <AdminDebouncedSearchInput
            value={queryState.search}
            onDebouncedChange={onSearchChange}
            placeholder="Search by name or email"
          />
        }
      >
        <Select
          value={queryState.role}
          onValueChange={(value) =>
            onRoleChange(value as AdminUserListQueryState['role'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {adminUserRoleLabelByValue[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queryState.sort}
          onValueChange={(value) =>
            onSortChange(value as AdminUserListQueryState['sort'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(adminUserSortLabelByValue).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbarFiltersPanel>
    </div>
  );
}
