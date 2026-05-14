'use client';

import Image from 'next/image';
import { Check, Plus, Trash2 } from 'lucide-react';
import {
  Controller,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
  type Control,
  type FieldArrayWithId,
} from 'react-hook-form';

import type { AdminProductImage } from '@/features/admin/types';
import type { AdminProductFormValues } from '@/features/admin/types/admin-products.types';
import { LOW_STOCK_THRESHOLD } from '@/features/admin/utils/admin-products.constants';
import { adminVariantStatusLabelByValue } from '@/features/admin/utils/admin-products.utils';
import { PRODUCT_LAYOUT_OPTIONS } from '@/features/shop/utils/product-list-options.utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { AdminSwitchOptionsEditor } from './AdminSwitchOptionsEditor';

type AdminVariantEditorProps = {
  productType: AdminProductFormValues['productType'];
  productImages: AdminProductImage[];
  fields: FieldArrayWithId<AdminProductFormValues, 'variants', 'fieldId'>[];
  control: Control<AdminProductFormValues>;
  register: UseFormRegister<AdminProductFormValues>;
  setValue: UseFormSetValue<AdminProductFormValues>;
  errors: FieldErrors<AdminProductFormValues>;
  appendVariant: UseFieldArrayAppend<AdminProductFormValues, 'variants'>;
  removeVariant: UseFieldArrayRemove;
  buildEmptyVariant: () => AdminProductFormValues['variants'][number];
};

export function AdminVariantEditor({
  productType,
  productImages,
  fields,
  control,
  register,
  setValue,
  errors,
  appendVariant,
  removeVariant,
  buildEmptyVariant,
}: AdminVariantEditorProps) {
  const watchedVariants = useWatch({
    control,
    name: 'variants',
  }) ?? [];
  const isKeyboardCategory = productType === 'keyboards';
  const optionFieldLabel = 'Variant Name';
  const optionFieldPlaceholder = 'Base Kit';

  const setDefaultVariant = (variantIndex: number) => {
    fields.forEach((_, index) => {
      setValue(`variants.${index}.isDefault`, index === variantIndex, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const setVariantThumbnailImage = (
    variantIndex: number,
    thumbnailImageId?: string
  ) => {
    setValue(`variants.${variantIndex}.thumbnailImageId`, thumbnailImageId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeVariantWithFallbackDefault = (variantIndex: number) => {
    if (watchedVariants.length <= 1) {
      return;
    }

    const isRemovingDefault = watchedVariants[variantIndex]?.isDefault ?? false;
    const nextVariants = watchedVariants.filter(
      (_, index) => index !== variantIndex
    );

    if (isRemovingDefault && nextVariants.length > 0) {
      const nextDefaultIndex = Math.min(variantIndex, nextVariants.length - 1);
      nextVariants[nextDefaultIndex] = {
        ...nextVariants[nextDefaultIndex],
        isDefault: true,
      };
    }

    removeVariant(variantIndex);

    if (isRemovingDefault && nextVariants.length > 0) {
      nextVariants.forEach((variant, index) => {
        setValue(`variants.${index}.isDefault`, Boolean(variant.isDefault), {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Variants</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => appendVariant(buildEmptyVariant())}
        >
          <Plus className="size-3.5" />
          Add Variant
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.fieldId}
            className="border-border/70 bg-background/30 rounded-xl border p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Variant {index + 1}
              </p>
              <Button
                type="button"
                size="icon"
                variant={
                  watchedVariants[index]?.isDefault ? 'default' : 'outline'
                }
                className="size-9"
                title={
                  watchedVariants[index]?.isDefault
                    ? 'Default variant'
                    : 'Set as default variant'
                }
                aria-label={
                  watchedVariants[index]?.isDefault
                    ? 'Default variant'
                    : 'Set as default variant'
                }
                onClick={() => setDefaultVariant(index)}
              >
                <Check className="size-3.5" />
              </Button>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Color</label>
                <Input
                  {...register(`variants.${index}.color`)}
                  placeholder="Matte Black"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.color?.message}
                </p>
              </div>

              {isKeyboardCategory ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Layout</label>
                  <Controller
                    control={control}
                    name={`variants.${index}.layout`}
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value || '__placeholder__'}
                        onValueChange={(value) =>
                          controllerField.onChange(
                            value === '__placeholder__' ? '' : value
                          )
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-10! w-full min-w-0"
                        >
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__placeholder__" disabled>
                            Select layout
                          </SelectItem>
                          {PRODUCT_LAYOUT_OPTIONS.map((layout) => (
                            <SelectItem key={layout} value={layout}>
                              {layout}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-destructive text-xs">
                    {errors.variants?.[index]?.layout?.message}
                  </p>
                </div>
              ) : null}

              {isKeyboardCategory ? null : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    {optionFieldLabel}
                  </label>
                  <Input
                    {...register(`variants.${index}.switchType`)}
                    placeholder={optionFieldPlaceholder}
                    className="h-10"
                  />
                  <p className="text-destructive text-xs">
                    {errors.variants?.[index]?.switchType?.message}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold">SKU</label>
                <Input
                  {...register(`variants.${index}.sku`)}
                  placeholder="NOVA75-BLK-LIN"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.sku?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Status</label>
                <Controller
                  control={control}
                  name={`variants.${index}.status`}
                  render={({ field: controllerField }) => (
                    <Select
                      value={controllerField.value}
                      onValueChange={controllerField.onChange}
                    >
                      <SelectTrigger size="sm" className="h-10! w-full min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(adminVariantStatusLabelByValue).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.status?.message}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold">
                  Variant Thumbnail
                </label>
                {productImages.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                      type="button"
                      className={`border-border bg-background hover:border-primary/50 flex min-h-20 items-center justify-center rounded-md border p-3 text-center text-xs font-medium transition-colors ${
                        !watchedVariants[index]?.thumbnailImageId
                          ? 'border-primary ring-primary/20 ring-2'
                          : ''
                      }`}
                      onClick={() => setVariantThumbnailImage(index)}
                    >
                      Inherit product thumbnail
                    </button>
                    {productImages.map((image) => {
                      const isSelected =
                        watchedVariants[index]?.thumbnailImageId === image.id;

                      return (
                        <button
                          key={image.id}
                          type="button"
                          className={`border-border bg-background hover:border-primary/50 flex overflow-hidden rounded-md border text-left transition-colors ${
                            isSelected ? 'border-primary ring-primary/20 ring-2' : ''
                          }`}
                          onClick={() =>
                            setVariantThumbnailImage(index, image.id)
                          }
                        >
                          <div className="relative aspect-square w-16 shrink-0 overflow-hidden">
                            <Image
                              src={image.imageUrl}
                              alt={image.altText ?? `Variant ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 p-2">
                            <p className="text-muted-foreground truncate text-[11px]">
                              {image.isPrimary ? 'Product thumbnail' : 'Gallery image'}
                            </p>
                            {isSelected ? (
                              <Check className="text-primary size-3.5 shrink-0" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border-border/70 bg-background/40 rounded-md border border-dashed p-3">
                    <p className="text-muted-foreground text-xs">
                      Upload product gallery images before choosing variant thumbnails.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-2 md:col-span-2 md:grid-cols-3">
                {!isKeyboardCategory ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">
                        Original Price
                      </label>
                      <Input
                        {...register(`variants.${index}.originalPrice`, {
                          setValueAs: (value) => {
                            if (value === '') {
                              return '';
                            }

                            const parsed = Number(value);
                            return Number.isNaN(parsed) ? '' : parsed;
                          },
                        })}
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-10"
                      />
                      <p className="text-destructive text-xs">
                        {errors.variants?.[index]?.originalPrice?.message}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Price</label>
                      <Input
                        {...register(`variants.${index}.price`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-10"
                      />
                      <p className="text-destructive text-xs">
                        {errors.variants?.[index]?.price?.message}
                      </p>
                    </div>
                  </>
                ) : null}

                <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    {isKeyboardCategory
                      ? 'Stock (Auto-calculated from switch options)'
                      : `Stock (Low-stock at ${LOW_STOCK_THRESHOLD} or below)`}
                  </label>
                  <Input
                    {...register(`variants.${index}.stock`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    step={1}
                    className="h-10"
                    readOnly={isKeyboardCategory}
                    aria-disabled={isKeyboardCategory}
                  />
                  {errors.variants?.[index]?.stock?.message ? (
                    <p className="text-destructive text-xs">
                      {errors.variants?.[index]?.stock?.message}
                    </p>
                  ) : isKeyboardCategory ? (
                    <p className="text-muted-foreground text-xs">
                      Update switch option stock below to change this total.
                    </p>
                  ) : null}
                </div>
              </div>

              {isKeyboardCategory ? (
                <AdminSwitchOptionsEditor
                  variantIndex={index}
                  control={control}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                />
              ) : null}
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeVariantWithFallbackDefault(index)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-destructive text-xs">{errors.variants?.message}</p>
    </div>
  );
}
