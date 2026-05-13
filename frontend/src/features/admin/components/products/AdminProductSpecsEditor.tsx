'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  type FieldArrayWithId,
} from 'react-hook-form';

import type { AdminProductFormValues } from '@/features/admin/types/admin-products.types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type AdminProductSpecsEditorProps = {
  fields: FieldArrayWithId<AdminProductFormValues, 'specs', 'fieldId'>[];
  register: UseFormRegister<AdminProductFormValues>;
  errors: FieldErrors<AdminProductFormValues>;
  appendSpec: UseFieldArrayAppend<AdminProductFormValues, 'specs'>;
  removeSpec: UseFieldArrayRemove;
  buildEmptySpec: () => AdminProductFormValues['specs'][number];
};

export function AdminProductSpecsEditor({
  fields,
  register,
  errors,
  appendSpec,
  removeSpec,
  buildEmptySpec,
}: AdminProductSpecsEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Technical Specs</p>
          <p className="text-muted-foreground text-xs">
            Add the product-level details shown on the product page.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => appendSpec(buildEmptySpec())}
        >
          <Plus className="size-3.5" />
          Add Spec
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="border-border/70 bg-background/20 rounded-md border border-dashed px-4 py-5 text-sm text-muted-foreground">
          No specs yet.
        </div>
      ) : null}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.fieldId}
            className="border-border/70 bg-background/20 rounded-md border p-3"
          >
            <div className="grid gap-2 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1.4fr)_44px]">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Group</label>
                <Input
                  {...register(`specs.${index}.groupName`)}
                  placeholder="General"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.specs?.[index]?.groupName?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Name</label>
                <Input
                  {...register(`specs.${index}.specKey`)}
                  placeholder="Layout"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.specs?.[index]?.specKey?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Value</label>
                <Input
                  {...register(`specs.${index}.specValue`)}
                  placeholder="TKL (80%)"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {errors.specs?.[index]?.specValue?.message}
                </p>
              </div>

              <div className="flex items-start justify-end pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10"
                  title="Remove spec"
                  aria-label="Remove spec"
                  onClick={() => removeSpec(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-destructive text-xs">{errors.specs?.message}</p>
    </div>
  );
}
