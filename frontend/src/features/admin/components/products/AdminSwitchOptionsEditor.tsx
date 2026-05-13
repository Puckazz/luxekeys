'use client';

import { useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import {
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  useFieldArray,
  useWatch,
  type Control,
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

type AdminSwitchOptionsEditorProps = {
  variantIndex: number;
  control: Control<AdminProductFormValues>;
  register: UseFormRegister<AdminProductFormValues>;
  setValue: UseFormSetValue<AdminProductFormValues>;
  errors: FieldErrors<AdminProductFormValues>;
};

const buildEmptySwitchOption = () => ({
  name: '',
  switchType: '',
  originalPrice: '' as const,
  price: 0,
  stock: 0,
  isDefault: false,
  status: 'active' as const,
});

const getSwitchOptionsStockTotal = (
  switchOptions: AdminProductFormValues['variants'][number]['switchOptions']
) => {
  return switchOptions.reduce((total, option) => {
    return total + (Number.isFinite(option.stock) ? option.stock : 0);
  }, 0);
};

export function AdminSwitchOptionsEditor({
  variantIndex,
  control,
  register,
  setValue,
  errors,
}: AdminSwitchOptionsEditorProps) {
  const switchOptionsFieldArray = useFieldArray({
    control,
    name: `variants.${variantIndex}.switchOptions`,
    keyName: 'fieldId',
  });
  const switchOptions = switchOptionsFieldArray.fields;
  const watchedSwitchOptions =
    useWatch({
      control,
      name: `variants.${variantIndex}.switchOptions`,
    }) ?? [];
  const watchedVariantStock = useWatch({
    control,
    name: `variants.${variantIndex}.stock`,
  });
  const switchOptionsStockTotal =
    getSwitchOptionsStockTotal(watchedSwitchOptions);

  useEffect(() => {
    if (watchedVariantStock === switchOptionsStockTotal) {
      return;
    }

    setValue(`variants.${variantIndex}.stock`, switchOptionsStockTotal, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [setValue, switchOptionsStockTotal, variantIndex, watchedVariantStock]);

  const setDefaultSwitchOption = (optionIndex: number) => {
    switchOptions.forEach((_, index) => {
      setValue(
        `variants.${variantIndex}.switchOptions.${index}.isDefault`,
        index === optionIndex,
        { shouldDirty: true, shouldValidate: true }
      );
    });
  };

  const removeSwitchOption = (optionIndex: number) => {
    if (watchedSwitchOptions.length <= 1) {
      return;
    }

    const isRemovingDefault =
      watchedSwitchOptions[optionIndex]?.isDefault ?? false;
    const nextOptions = watchedSwitchOptions.filter(
      (_, index) => index !== optionIndex
    );

    if (isRemovingDefault && nextOptions.length > 0) {
      const nextDefaultIndex = Math.min(optionIndex, nextOptions.length - 1);
      nextOptions[nextDefaultIndex] = {
        ...nextOptions[nextDefaultIndex],
        isDefault: true,
      };
    }

    switchOptionsFieldArray.replace(nextOptions);
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">Switch Options</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            switchOptionsFieldArray.append({
              ...buildEmptySwitchOption(),
              isDefault: switchOptions.length === 0,
            });
          }}
        >
          <Plus className="size-3.5" />
          Add Switch
        </Button>
      </div>

      <div className="space-y-2">
        {switchOptions.map((option, optionIndex) => (
          <div
            key={option.fieldId}
            className="grid gap-3 rounded-md bg-card/40 p-3 md:grid-cols-2 xl:grid-cols-12 2xl:grid-cols-[minmax(180px,1.6fr)_minmax(120px,1fr)_minmax(160px,1.25fr)_minmax(120px,1fr)_minmax(110px,0.9fr)_minmax(160px,1.25fr)_88px]"
          >
            <div className="space-y-1 xl:col-span-3 2xl:col-span-1">
              <label className="text-xs font-semibold">Name</label>
              <Input
                {...register(
                  `variants.${variantIndex}.switchOptions.${optionIndex}.name`
                )}
                placeholder="Gateron Yellow Pro"
                className="h-9"
              />
              <p className="text-destructive text-xs">
                {
                  errors.variants?.[variantIndex]?.switchOptions?.[optionIndex]
                    ?.name?.message
                }
              </p>
            </div>

            <div className="space-y-1 xl:col-span-2 2xl:col-span-1">
              <label className="text-xs font-semibold">Type</label>
              <Input
                {...register(
                  `variants.${variantIndex}.switchOptions.${optionIndex}.switchType`
                )}
                placeholder="Linear"
                className="h-9"
              />
              <p className="text-destructive text-xs">
                {
                  errors.variants?.[variantIndex]?.switchOptions?.[optionIndex]
                    ?.switchType?.message
                }
              </p>
            </div>

            <div className="space-y-1 xl:col-span-3 2xl:col-span-1">
              <label className="text-xs font-semibold">Original Price</label>
              <Input
                {...register(
                  `variants.${variantIndex}.switchOptions.${optionIndex}.originalPrice`,
                  {
                    setValueAs: (value) => {
                      if (value === '') {
                        return '';
                      }

                      const parsed = Number(value);
                      return Number.isNaN(parsed) ? '' : parsed;
                    },
                  }
                )}
                type="number"
                min={0}
                step="0.01"
                className="h-9"
              />
              <p className="text-destructive text-xs">
                {
                  errors.variants?.[variantIndex]?.switchOptions?.[optionIndex]
                    ?.originalPrice?.message
                }
              </p>
            </div>

            <div className="space-y-1 xl:col-span-2 2xl:col-span-1">
              <label className="text-xs font-semibold">Price</label>
              <Input
                {...register(
                  `variants.${variantIndex}.switchOptions.${optionIndex}.price`,
                  { valueAsNumber: true }
                )}
                type="number"
                min={0}
                step="0.01"
                className="h-9"
              />
              <p className="text-destructive text-xs">
                {
                  errors.variants?.[variantIndex]?.switchOptions?.[optionIndex]
                    ?.price?.message
                }
              </p>
            </div>

            <div className="space-y-1 xl:col-span-2 2xl:col-span-1">
              <label className="text-xs font-semibold">Stock</label>
              <Input
                {...register(
                  `variants.${variantIndex}.switchOptions.${optionIndex}.stock`,
                  { valueAsNumber: true }
                )}
                type="number"
                min={0}
                step={1}
                className="h-9"
              />
              <p className="text-destructive text-xs">
                {
                  errors.variants?.[variantIndex]?.switchOptions?.[optionIndex]
                    ?.stock?.message
                }
              </p>
            </div>

            <div className="space-y-1 md:col-span-2 xl:col-span-4 2xl:col-span-1">
              <label className="text-xs font-semibold">Status</label>
              <Controller
                control={control}
                name={`variants.${variantIndex}.switchOptions.${optionIndex}.status`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="sm" className="h-9 w-full">
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
            </div>

            <div className="flex items-end justify-end gap-2 md:col-span-2 xl:col-span-8 2xl:col-span-1">
              <Button
                type="button"
                size="icon"
                variant={
                  watchedSwitchOptions[optionIndex]?.isDefault
                    ? 'default'
                    : 'outline'
                }
                className="size-9"
                title={
                  watchedSwitchOptions[optionIndex]?.isDefault
                    ? 'Default switch option'
                    : 'Set as default switch option'
                }
                aria-label={
                  watchedSwitchOptions[optionIndex]?.isDefault
                    ? 'Default switch option'
                    : 'Set as default switch option'
                }
                onClick={() => setDefaultSwitchOption(optionIndex)}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                title="Remove switch option"
                aria-label="Remove switch option"
                onClick={() => removeSwitchOption(optionIndex)}
                disabled={switchOptions.length <= 1}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-destructive text-xs">
        {errors.variants?.[variantIndex]?.switchOptions?.message}
      </p>
    </div>
  );
}
