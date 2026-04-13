'use client';

import { Filter } from 'lucide-react';

import {
  AdminDebouncedSearchInput,
  AdminToolbarFiltersPanel,
  AdminToolbarHeader,
} from '@/features/admin/components/common';
import {
  ADMIN_USER_STATUSES,
  type AdminUserListQueryState,
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
  onSearchChange: (search: string) => void;
  onRoleChange: (role: AdminUserListQueryState['role']) => void;
  onStatusChange: (status: AdminUserListQueryState['status']) => void;
  onSortChange: (sort: AdminUserListQueryState['sort']) => void;
  onCreateClick: () => void;
};

export function AdminUsersToolbar({
  actorRole,
  queryState,
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
          value={queryState.status}
          onValueChange={(value) =>
            onStatusChange(value as AdminUserListQueryState['status'])
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-36">
            <Filter className="size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ADMIN_USER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {adminUserStatusLabelByValue[status]}
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
