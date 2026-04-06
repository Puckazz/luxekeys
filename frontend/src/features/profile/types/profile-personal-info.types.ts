import type { ProfileUser } from '@/features/profile/types';

export type PersonalInfoFormValues = Pick<
  ProfileUser,
  'fullName' | 'email' | 'phone'
>;

export type ProfileUpdatePayload = PersonalInfoFormValues;
