'use client';

import { Edit2, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';

import { AdminTableIconActionButton } from '@/features/admin/components/common';
import type { AdminUser } from '@/features/admin/types/admin-users.types';
import {
  getAssignableUserRoles,
  adminUserRoleLabelByValue,
  adminUserStatusLabelByValue,
} from '@/features/admin/utils/admin-users.utils';
import { canManageUsersCrud, type UserRole } from '@/lib/rbac';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminUsersTableProps = {
  users: AdminUser[];
  actorRole: UserRole;
  isUpdatingRole: boolean;
  onRoleChange: (userId: string, nextRole: UserRole) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onRestore: (user: AdminUser) => void;
};

const statusBadgeVariantByValue: Record<
  AdminUser['status'],
  'success' | 'secondary' | 'destructive'
> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'destructive',
  archived: 'secondary',
};

export function AdminUsersTable({
  users,
  actorRole,
  isUpdatingRole,
  onRoleChange,
  onEdit,
  onDelete,
  onRestore,
}: AdminUsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last login</TableHead>
          <TableHead>Access action</TableHead>
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((user) => {
          const assignableRoles = getAssignableUserRoles(actorRole, user.role);
          const canEditRole = assignableRoles.length > 0;
          const roleOptions = canEditRole ? assignableRoles : [user.role];

          return (
            <TableRow key={user.id}>
              <TableCell className="pl-5">
                <div className="min-w-68">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {user.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">
                  {adminUserRoleLabelByValue[user.role]}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant={statusBadgeVariantByValue[user.status]}>
                  {adminUserStatusLabelByValue[user.status]}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground text-sm">
                {new Date(user.lastLoginAt).toLocaleString()}
              </TableCell>

              <TableCell className="pr-5">
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(nextRole) =>
                      onRoleChange(user.id, nextRole as UserRole)
                    }
                    disabled={isUpdatingRole || !canEditRole}
                  >
                    <SelectTrigger size="sm" className="h-9 min-w-34">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {adminUserRoleLabelByValue[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!canEditRole ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <ShieldAlert className="size-3.5" />
                      Restricted
                    </span>
                  ) : null}
                </div>
              </TableCell>

              <TableCell className="pr-5 text-right">
                <div className="flex justify-end gap-1">
                  <AdminTableIconActionButton
                    icon={Edit2}
                    label="Edit user"
                    onClick={() => onEdit(user)}
                    disabled={!canManageUsersCrud(actorRole)}
                  />

                  {user.status === 'archived' ? (
                    <AdminTableIconActionButton
                      icon={RotateCcw}
                      label="Restore user"
                      onClick={() => onRestore(user)}
                      disabled={!canManageUsersCrud(actorRole)}
                    />
                  ) : (
                    <AdminTableIconActionButton
                      icon={Trash2}
                      label="Archive user"
                      onClick={() => onDelete(user)}
                      disabled={!canManageUsersCrud(actorRole)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
