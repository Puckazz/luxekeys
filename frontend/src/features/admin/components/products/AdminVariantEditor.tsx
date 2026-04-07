'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  Controller,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  type Control,
  type FieldArrayWithId,
} from 'react-hook-form';

import type { AdminProductFormValues } from '@/features/admin/types/admin-products.types';
import { adminVariantStatusLabelByValue } from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminVariantEditorProps = {
  fields: FieldArrayWithId<AdminProductFormValues, 'variants', 'fieldId'>[];
  control: Control<AdminProductFormValues>;
  register: UseFormRegister<AdminProductFormValues>;
  errors: FieldErrors<AdminProductFormValues>;
  appendVariant: UseFieldArrayAppend<AdminProductFormValues, 'variants'>;
  removeVariant: UseFieldArrayRemove;
  buildEmptyVariant: () => AdminProductFormValues['variants'][number];
};

export function AdminVariantEditor({
  fields,
  control,
  register,
  errors,
  appendVariant,
  removeVariant,
  buildEmptyVariant,
}: AdminVariantEditorProps) {
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

              <div className="space-y-1">
                <label className="text-xs font-semibold">Switch Type</label>
                <Input
                  {...register(`variants.${index}.switchType`)}
                  placeholder="Linear"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.switchType?.message}
                </p>
              </div>

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
                      <SelectTrigger size="sm" className="h-10 w-full">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold">Price</label>
                <Input
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  step={1}
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.price?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Stock</label>
                <Input
                  {...register(`variants.${index}.stock`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  step={1}
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.variants?.[index]?.stock?.message}
                </p>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeVariant(index)}
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
