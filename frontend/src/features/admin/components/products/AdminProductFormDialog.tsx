'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { adminProductFormSchema } from '@/features/admin/schemas/admin-products.schema';
import type { AdminProduct, AdminProductStatus } from '@/features/admin/types';
import type {
  AdminProductFormValues,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';
import { ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE } from '@/features/admin/utils/admin-products.constants';
import {
  adminProductStatusLabelByValue,
  buildDefaultVariant,
} from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import {
  DialogClose,
  Dialog,
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

import { AdminVariantEditor } from './AdminVariantEditor';

type AdminProductFormDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  product: AdminProduct | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: UpsertAdminProductInput) => void;
};

const toFormValues = (product: AdminProduct | null): AdminProductFormValues => {
  if (!product) {
    return {
      name: '',
      category: 'keyboards',
      description: '',
      thumbnail: '',
      status: 'active',
      variants: [buildDefaultVariant()],
    };
  }

  return {
    name: product.name,
    category: product.category,
    description: product.description,
    thumbnail: product.thumbnail,
    status: product.status === 'archived' ? 'draft' : product.status,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      switchType: variant.switchType,
      sku: variant.sku,
      originalPrice: variant.originalPrice,
      price: variant.price,
      stock: variant.stock,
      status: variant.status,
    })),
  };
};

export function AdminProductFormDialog({
  mode,
  open,
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminProductFormDialogProps) {
  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: toFormValues(product),
  });

  const { control, register, handleSubmit, reset, formState } = form;

  const variantsFieldArray = useFieldArray({
    control,
    name: 'variants',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(product));
    }
  }, [open, product, reset]);

  const submitHandler = (values: AdminProductFormValues) => {
    onSubmit({
      id: product?.id,
      name: values.name,
      category: values.category,
      description: values.description,
      thumbnail: values.thumbnail,
      status: values.status,
      variants: values.variants,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-0 max-w-4xl flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b px-4 pt-4 pr-10 pb-3 sm:px-6 sm:pt-6">
          <DialogTitle>
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            Configure product details and variant combinations.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit(submitHandler)}
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Product Name</label>
                <Input
                  {...register('name')}
                  placeholder="Nova75 Wireless Keyboard"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {formState.errors.name?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Category</label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-destructive text-xs">
                  {formState.errors.category?.message}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold">Description</label>
                <Textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe product highlights and intended usage."
                />
                <p className="text-destructive text-xs">
                  {formState.errors.description?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Thumbnail URL</label>
                <Input
                  {...register('thumbnail')}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {formState.errors.thumbnail?.message}
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
                            AdminProductStatus,
                            'archived'
                          >[]
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            {adminProductStatusLabelByValue[status]}
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
            </div>

            <AdminVariantEditor
              fields={variantsFieldArray.fields}
              control={control}
              register={register}
              errors={formState.errors}
              appendVariant={variantsFieldArray.append}
              removeVariant={variantsFieldArray.remove}
              buildEmptyVariant={buildDefaultVariant}
            />
          </div>

          <div className="dark:bg-input/30 flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
