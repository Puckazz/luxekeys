'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { adminUserFormSchema } from '@/features/admin/schemas/admin-users.schema';
import type {
  AdminUser,
  AdminUserFormValues,
  UpsertAdminUserInput,
} from '@/features/admin/types/admin-users.types';
import {
  adminUserRoleLabelByValue,
  adminUserStatusLabelByValue,
} from '@/features/admin/utils/admin-users.utils';
import { USER_ROLES } from '@/lib/rbac';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminUserFormDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  user: AdminUser | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: Omit<UpsertAdminUserInput, 'actorRole'>) => void;
};

const toFormValues = (user: AdminUser | null): AdminUserFormValues => {
  if (!user) {
    return {
      name: '',
      email: '',
      role: 'customer',
      status: 'active',
    };
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status === 'archived' ? 'inactive' : user.status,
  };
};

export function AdminUserFormDialog({
  mode,
  open,
  user,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminUserFormDialogProps) {
  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: toFormValues(user),
  });

  const { control, register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset(toFormValues(user));
    }
  }, [open, reset, user]);

  const submitHandler = (values: AdminUserFormValues) => {
    onSubmit({
      id: user?.id,
      name: values.name,
      email: values.email,
      role: values.role,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new account with role and status.'
              : 'Update profile details and account permissions.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name</label>
            <Input
              {...register('name')}
              placeholder="John Doe"
              className="h-10"
            />
            <p className="text-destructive text-xs">
              {formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Email</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="name@example.com"
              className="h-10"
            />
            <p className="text-destructive text-xs">
              {formState.errors.email?.message}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Role</label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="sm" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {adminUserRoleLabelByValue[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-destructive text-xs">
                {formState.errors.role?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="sm" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['active', 'inactive', 'suspended'] as const).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {adminUserStatusLabelByValue[status]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-destructive text-xs">
                {formState.errors.status?.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
