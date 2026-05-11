'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, MapPinHouse, Plus, Star, Trash2 } from 'lucide-react';

import {
  useAddressMutations,
  useAddressesQuery,
} from '@/features/profile/hooks';
import { useStatesQuery } from '@/shared/hooks/useLocationQueries';
import { addressSchema } from '@/features/profile/schemas/profile.schema';
import type { AddressFormValues, SavedAddress } from '@/features/profile/types';
import { formatAccountDate } from '@/features/profile/utils/profile.utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import AddressFormFields from '@/shared/components/forms/AddressFormFields';

const initialAddressValues: AddressFormValues = {
  label: '',
  fullName: '',
  phone: '',
  streetAddress: '',
  country: 'Vietnam',
  province: '',
  city: '',
  isDefault: false,
};

const toFormValues = (address: SavedAddress): AddressFormValues => {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    streetAddress: address.streetAddress,
    country: address.country ?? 'Vietnam',
    province: address.province,
    city: address.city,
    isDefault: address.isDefault,
  };
};

export default function AddressesPage() {
  const addressesQuery = useAddressesQuery();
  const {
    upsertAddress,
    removeAddress,
    setDefaultAddress,
    isSavingAddress,
    isRemovingAddress,
    isSettingDefaultAddress,
  } = useAddressMutations();

  const addresses = useMemo(() => {
    return addressesQuery.data ?? [];
  }, [addressesQuery.data]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const editingAddress = useMemo(() => {
    if (!editingAddressId) {
      return null;
    }

    return addresses.find((address) => address.id === editingAddressId) ?? null;
  }, [addresses, editingAddressId]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialAddressValues,
  });

  const selectedCountry = watch('country');
  const selectedProvince = watch('province');

  const { data: states, isFetching: isFetchingStates } =
    useStatesQuery(selectedCountry);

  const countryOptions = ['Vietnam', 'United States', 'Canada', 'Australia'];
  const provinceOptions = states?.map((p) => p.name) || [];

  const openCreateEditor = () => {
    setEditingAddressId(null);
    reset(initialAddressValues);
    setIsEditorOpen(true);
  };

  const openEditEditor = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    reset(toFormValues(address));
    setIsEditorOpen(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    await upsertAddress({
      ...values,
      id: editingAddressId ?? undefined,
    });
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/70 bg-card/35">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Addresses</CardTitle>
            <CardDescription>
              Manage your shipping destinations and default checkout address.
            </CardDescription>
          </div>
          <Button type="button" onClick={openCreateEditor} className="gap-2">
            <Plus className="size-4" />
            Add Address
          </Button>
        </CardHeader>
      </Card>

      {addresses.length === 0 ? (
        <Card className="border-border/70 bg-card/35">
          <CardContent className="py-10 text-center">
            <MapPinHouse className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground mt-3 font-semibold">No address yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add your first shipping address for faster checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="border-border/70 bg-card/35">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-lg font-semibold">
                        {address.label}
                      </p>
                      {address.isDefault ? (
                        <Badge variant="success" className="text-[10px]">
                          Default
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {address.fullName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {address.phone}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {address.streetAddress}, {address.province},{' '}
                      {address.city}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Added {formatAccountDate(address.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditEditor(address)}
                    >
                      <Edit3 className="size-3.5" />
                      Edit
                    </Button>
                    {!address.isDefault ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultAddress(address.id)}
                        disabled={isSettingDefaultAddress}
                      >
                        <Star className="size-3.5" />
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAddress(address.id)}
                      disabled={isRemovingAddress}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="flex max-h-[90vh] min-h-0 max-w-2xl flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b px-4 pt-4 pr-10 pb-3 sm:px-6 sm:pt-6">
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
            <DialogDescription>
              Keep your shipping details accurate for smooth delivery.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-semibold">
                  Label
                </label>
                <Input {...register('label')} placeholder="Home, Office..." />
                {errors.label ? (
                  <p className="text-destructive text-xs font-medium">
                    {errors.label.message}
                  </p>
                ) : null}
              </div>

              <AddressFormFields
                fullNameField={register('fullName')}
                phoneField={register('phone')}
                streetAddressField={register('streetAddress')}
                provinceField={register('province')}
                cityField={register('city')}
                countrySelect={{
                  value: watch('country'),
                  options: countryOptions,
                  onValueChange: (nextCountry) => {
                    setValue('country', nextCountry, { shouldValidate: true });
                    setValue('province', '', { shouldValidate: true });
                    setValue('city', '', { shouldValidate: true });
                  },
                  triggerClassName: 'bg-input/30 h-12 w-full rounded-md',
                }}
                provinceSelect={{
                  value: selectedProvince,
                  options: provinceOptions,
                  onValueChange: (nextProvince) => {
                    setValue('province', nextProvince, {
                      shouldValidate: true,
                    });
                    setValue('city', '', { shouldValidate: true });
                  },
                  triggerClassName: 'bg-input/30 h-12 w-full rounded-md',
                  disabled: !selectedCountry || isFetchingStates,
                }}
                messages={{
                  fullName: errors.fullName?.message,
                  phone: errors.phone?.message,
                  streetAddress: errors.streetAddress?.message,
                  country: errors.country?.message,
                  province: errors.province?.message,
                  city: errors.city?.message,
                }}
              />

              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="isDefault"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => {
                        if (value !== 'indeterminate') {
                          field.onChange(value);
                        }
                      }}
                    />
                  )}
                />
                <span className="text-foreground text-sm">
                  Set as default address
                </span>
              </div>
            </div>

            <div className="dark:bg-input/30 flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="lg">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" size="lg" disabled={isSavingAddress}>
                {isSavingAddress
                  ? 'Saving...'
                  : editingAddress
                    ? 'Update address'
                    : 'Add address'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
