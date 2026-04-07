'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { adminCategoryFormSchema } from '@/features/admin/schemas/admin-categories.schema';
import type {
  AdminCategory,
  AdminCategoryStatus,
} from '@/features/admin/types';
import type {
  AdminCategoryFormValues,
  UpsertAdminCategoryInput,
} from '@/features/admin/types/admin-categories.types';
import { adminCategoryStatusLabelByValue } from '@/features/admin/utils/admin-categories.utils';
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
import { Textarea } from '@/shared/components/ui/textarea';

type AdminCategoryFormDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  category: AdminCategory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: UpsertAdminCategoryInput) => void;
};

const toFormValues = (
  category: AdminCategory | null
): AdminCategoryFormValues => {
  if (!category) {
    return {
      name: '',
      description: '',
      status: 'active',
    };
  }

  return {
    name: category.name,
    description: category.description,
    status: category.status === 'archived' ? 'draft' : category.status,
  };
};

export function AdminCategoryFormDialog({
  mode,
  open,
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminCategoryFormDialogProps) {
  const form = useForm<AdminCategoryFormValues>({
    resolver: zodResolver(adminCategoryFormSchema),
    defaultValues: toFormValues(category),
  });

  const { control, register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset(toFormValues(category));
    }
  }, [open, category, reset]);

  const submitHandler = (values: AdminCategoryFormValues) => {
    onSubmit({
      id: category?.id,
      name: values.name,
      description: values.description,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Category' : 'Edit Category'}
          </DialogTitle>
          <DialogDescription>
            Configure category details for the catalog.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Category Name</label>
            <Input
              {...register('name')}
              placeholder="Keyboards"
              className="h-10"
            />
            <p className="text-destructive text-xs">
              {formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Description</label>
            <Textarea
              {...register('description')}
              rows={4}
              placeholder="Describe this category and what products it includes."
            />
            <p className="text-destructive text-xs">
              {formState.errors.description?.message}
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
                        AdminCategoryStatus,
                        'archived'
                      >[]
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {adminCategoryStatusLabelByValue[status]}
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
              {mode === 'create' ? 'Create Category' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
