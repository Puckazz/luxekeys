'use client';

import { CheckCircle2, Mail, Phone } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type SelectFieldConfig = {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  triggerClassName?: string;
};

type AddressFormFieldMessages = {
  fullName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  district?: string;
};

type AddressFormFieldsProps = {
  fullNameField: UseFormRegisterReturn;
  phoneField: UseFormRegisterReturn;
  streetAddressField: UseFormRegisterReturn;
  cityField?: UseFormRegisterReturn;
  districtField?: UseFormRegisterReturn;
  emailField?: UseFormRegisterReturn;
  citySelect?: SelectFieldConfig;
  districtSelect?: SelectFieldConfig;
  messages?: AddressFormFieldMessages;
  showEmail?: boolean;
  showValidatedAddress?: boolean;
  validatedAddressLabel?: string;
  showEmailIcon?: boolean;
  showPhoneIcon?: boolean;
};

const renderError = (message?: string) => {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-xs font-medium">{message}</p>;
};

export default function AddressFormFields({
  fullNameField,
  phoneField,
  streetAddressField,
  cityField,
  districtField,
  emailField,
  citySelect,
  districtSelect,
  messages,
  showEmail = false,
  showValidatedAddress = false,
  validatedAddressLabel = 'Validated address',
  showEmailIcon = false,
  showPhoneIcon = false,
}: AddressFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-foreground text-sm font-semibold">
          Full Name
        </label>
        <div className="relative mt-2">
          <Input {...fullNameField} />
        </div>
        {renderError(messages?.fullName)}
      </div>

      {showEmail ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-foreground text-sm font-semibold">
              Email Address
            </label>
            <div className="relative mt-2">
              {showEmailIcon ? (
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              ) : null}
              <Input
                {...emailField}
                className={showEmailIcon ? 'pl-9' : undefined}
              />
            </div>
            {renderError(messages?.email)}
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-sm font-semibold">
              Phone Number
            </label>
            <div className="relative mt-2">
              {showPhoneIcon ? (
                <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              ) : null}
              <Input
                {...phoneField}
                className={showPhoneIcon ? 'pl-9' : undefined}
              />
            </div>
            {renderError(messages?.phone)}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-foreground text-sm font-semibold">Phone</label>
          <Input {...phoneField} />
          {renderError(messages?.phone)}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-foreground text-sm font-semibold">
          Street Address
        </label>
        <div className="relative mt-2">
          <Input {...streetAddressField} />
        </div>
        {showValidatedAddress ? (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            {validatedAddressLabel}
          </p>
        ) : null}
        {renderError(messages?.streetAddress)}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-foreground text-sm font-semibold">City</label>
          {citySelect ? (
            <Select
              value={citySelect.value}
              onValueChange={citySelect.onValueChange}
            >
              <SelectTrigger
                className={
                  citySelect.triggerClassName ??
                  'bg-input/30 h-12 w-full rounded-md'
                }
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {citySelect.options.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input {...cityField} />
          )}
          {renderError(messages?.city)}
        </div>

        <div className="space-y-2">
          <label className="text-foreground text-sm font-semibold">
            District
          </label>
          {districtSelect ? (
            <Select
              value={districtSelect.value}
              onValueChange={districtSelect.onValueChange}
            >
              <SelectTrigger
                className={districtSelect.triggerClassName ?? 'w-full'}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {districtSelect.options.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input {...districtField} />
          )}
          {renderError(messages?.district)}
        </div>
      </div>
    </>
  );
}
