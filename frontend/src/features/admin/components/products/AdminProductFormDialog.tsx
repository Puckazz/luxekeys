'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { adminProductsApi } from '@/features/admin/api/admin-products.api';
import { adminProductFormSchema } from '@/features/admin/schemas/admin-products.schema';
import type { AdminProduct, AdminProductStatus } from '@/features/admin/types';
import type {
  AdminProductFormValues,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';
import { ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE } from '@/features/admin/utils/admin-products.constants';
import {
  adminProductStatusLabelByValue,
  buildDefaultProductSpec,
  buildDefaultVariant,
  normalizeAdminProductSpec,
} from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
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

import { AdminProductSpecsEditor } from './AdminProductSpecsEditor';
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
      shortDescription: '',
      productType: 'keyboards',
      brandId: '',
      catalogCategoryId: '',
      description: '',
      thumbnail: '',
      tags: '',
      isFeatured: false,
      status: 'active',
      specs: [],
      variants: [buildDefaultVariant()],
    };
  }

  const isKeyboardProduct = product.productType === 'keyboards';

  return {
    name: product.name,
    shortDescription: product.shortDescription ?? '',
    productType: product.productType,
    brandId: product.brandId ?? '',
    catalogCategoryId: product.catalogCategoryId ?? '',
    description: product.description,
    thumbnail: product.thumbnail,
    tags: product.tags.join(', '),
    isFeatured: product.isFeatured,
    status: product.status === 'archived' ? 'draft' : product.status,
    specs: product.specs.map(normalizeAdminProductSpec),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      layout: variant.layout,
      switchType: variant.switchType,
      sku: variant.sku,
      originalPrice: variant.originalPrice ?? '',
      price: variant.price,
      stock: variant.stock,
      isDefault: variant.isDefault || false,
      status: variant.status,
      switchOptions:
        variant.switchOptions.length > 0
          ? variant.switchOptions.map((option, index) => ({
              id: option.id,
              name: option.name,
              switchType: option.switchType,
              originalPrice: option.originalPrice ?? '',
              price: option.price,
              stock: option.stock,
              isDefault: option.isDefault || index === 0,
              status: option.status,
            }))
          : isKeyboardProduct
            ? buildDefaultVariant().switchOptions
            : [],
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

  const {
    control,
    register,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState,
  } = form;
  const productType = form.watch('productType');
  const brandOptionsQuery = useQuery({
    queryKey: ['admin-product-brand-options'],
    queryFn: () => adminProductsApi.getBrandOptions(),
    staleTime: 60_000,
  });
  const categoryOptionsQuery = useQuery({
    queryKey: ['admin-product-category-options'],
    queryFn: () => adminProductsApi.getCategoryOptions(),
    staleTime: 60_000,
  });

  const variantsFieldArray = useFieldArray({
    control,
    name: 'variants',
    keyName: 'fieldId',
  });
  const specsFieldArray = useFieldArray({
    control,
    name: 'specs',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(product));
    }
  }, [open, product, reset]);

  useEffect(() => {
    const variants = getValues('variants');

    variants.forEach((variant, index) => {
      if (productType !== 'keyboards') {
        if (variant.switchOptions.length > 0) {
          setValue(`variants.${index}.switchOptions`, [], {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        return;
      }

      if (variant.switchOptions.length === 0) {
        setValue(
          `variants.${index}.switchOptions`,
          buildDefaultVariant().switchOptions,
          { shouldDirty: true, shouldValidate: true }
        );
      }
    });
  }, [getValues, productType, setValue]);

  const submitHandler = (values: AdminProductFormValues) => {
    onSubmit({
      id: product?.id,
      name: values.name,
      shortDescription: values.shortDescription.trim() || undefined,
      productType: values.productType,
      brandId: values.brandId || undefined,
      catalogCategoryId: values.catalogCategoryId || undefined,
      description: values.description,
      thumbnail: values.thumbnail,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isFeatured: values.isFeatured,
      status: values.status,
      specs: values.specs.map((spec) => ({
        id: spec.id,
        groupName: spec.groupName.trim() || undefined,
        specKey: spec.specKey.trim(),
        specValue: spec.specValue.trim(),
      })),
      variants: values.variants.map((variant) => {
        const defaultSwitchOption =
          variant.switchOptions.find((option) => option.isDefault) ??
          variant.switchOptions[0];

        return {
          ...variant,
          switchType:
            values.productType === 'keyboards'
              ? defaultSwitchOption?.switchType || ''
              : variant.switchType,
          originalPrice:
            values.productType === 'keyboards'
              ? defaultSwitchOption?.originalPrice === ''
                ? null
                : (defaultSwitchOption?.originalPrice ?? null)
              : variant.originalPrice === ''
                ? null
                : variant.originalPrice,
          price:
            values.productType === 'keyboards'
              ? (defaultSwitchOption?.price ?? variant.price)
              : variant.price,
          switchOptions:
            values.productType === 'keyboards'
              ? variant.switchOptions.map((option) => ({
                  ...option,
                  originalPrice:
                    option.originalPrice === '' ? null : option.originalPrice,
                }))
              : [],
        };
      }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-0 max-w-6xl flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-6xl">
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
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] sm:px-6 sm:py-6">
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
                <label className="text-xs font-semibold">Product Type</label>
                <Controller
                  control={control}
                  name="productType"
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
                  {formState.errors.productType?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Brand</label>
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(value) =>
                        field.onChange(value === '__none__' ? '' : value)
                      }
                    >
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue placeholder="No brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No brand</SelectItem>
                        {(brandOptionsQuery.data ?? []).map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Catalog Category
                </label>
                <Controller
                  control={control}
                  name="catalogCategoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(value) =>
                        field.onChange(value === '__none__' ? '' : value)
                      }
                    >
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue placeholder="No category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {(categoryOptionsQuery.data ?? []).map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold">
                  Short Description
                </label>
                <Textarea
                  {...register('shortDescription')}
                  rows={2}
                  placeholder="Compact summary for cards and quick previews."
                />
                <p className="text-destructive text-xs">
                  {formState.errors.shortDescription?.message}
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
                <label className="text-xs font-semibold">
                  Tags (comma separated)
                </label>
                <Input
                  {...register('tags')}
                  placeholder="wireless, gasket mount, hot swap"
                  className="h-10"
                />
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

              <div className="flex items-center gap-3 md:col-span-1">
                <Controller
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <div>
                  <p className="text-xs font-semibold">Featured Product</p>
                  <p className="text-muted-foreground text-xs">
                    Promote this item in featured product sections.
                  </p>
                </div>
              </div>
            </div>

            <AdminVariantEditor
              productType={productType}
              fields={variantsFieldArray.fields}
              control={control}
              register={register}
              setValue={setValue}
              errors={formState.errors}
              appendVariant={variantsFieldArray.append}
              removeVariant={variantsFieldArray.remove}
              buildEmptyVariant={() => ({
                ...buildDefaultVariant(),
                switchOptions:
                  productType === 'keyboards'
                    ? buildDefaultVariant().switchOptions
                    : [],
              })}
            />

            <AdminProductSpecsEditor
              fields={specsFieldArray.fields}
              register={register}
              errors={formState.errors}
              appendSpec={specsFieldArray.append}
              removeSpec={specsFieldArray.remove}
              buildEmptySpec={buildDefaultProductSpec}
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
