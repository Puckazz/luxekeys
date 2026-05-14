'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { adminBrandFormSchema } from '@/features/admin/schemas/admin-brands.schema';
import type { AdminBrand, AdminBrandStatus } from '@/features/admin/types';
import type {
  AdminBrandFormValues,
  UpsertAdminBrandInput,
} from '@/features/admin/types/admin-brands.types';
import { adminBrandStatusLabelByValue } from '@/features/admin/utils/admin-brands.utils';
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

type AdminBrandFormDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  brand: AdminBrand | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: UpsertAdminBrandInput) => void;
};

const toFormValues = (brand: AdminBrand | null): AdminBrandFormValues => {
  if (!brand) {
    return {
      name: '',
      logoUrl: '',
      status: 'active',
    };
  }

  return {
    name: brand.name,
    logoUrl: brand.logoUrl ?? '',
    status: brand.status === 'archived' ? 'draft' : brand.status,
  };
};

export function AdminBrandFormDialog({
  mode,
  open,
  brand,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminBrandFormDialogProps) {
  const form = useForm<AdminBrandFormValues>({
    resolver: zodResolver(adminBrandFormSchema),
    defaultValues: toFormValues(brand),
  });

  const { control, register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset(toFormValues(brand));
    }
  }, [open, brand, reset]);

  const submitHandler = (values: AdminBrandFormValues) => {
    onSubmit({
      id: brand?.id,
      name: values.name,
      logoUrl: values.logoUrl || undefined,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Brand' : 'Edit Brand'}</DialogTitle>
          <DialogDescription>
            Configure brand details for catalog filters and product metadata.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Brand Name</label>
            <Input {...register('name')} placeholder="Keychron" className="h-10" />
            <p className="text-destructive text-xs">
              {formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Logo URL</label>
            <Input
              {...register('logoUrl')}
              placeholder="https://cdn.example.com/keychron.png"
              className="h-10"
            />
            <p className="text-destructive text-xs">
              {formState.errors.logoUrl?.message}
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
                    {(
                      ['active', 'draft'] as Exclude<
                        AdminBrandStatus,
                        'archived'
                      >[]
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {adminBrandStatusLabelByValue[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-destructive text-xs">
              {formState.errors.status?.message}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {mode === 'create' ? 'Create Brand' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
