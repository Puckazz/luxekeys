import type { SavedAddress } from '@/features/profile/types';

export type AddressFormValues = Omit<SavedAddress, 'id' | 'createdAt'>;

export type AddressUpsertPayload = AddressFormValues & {
  id?: string;
};
