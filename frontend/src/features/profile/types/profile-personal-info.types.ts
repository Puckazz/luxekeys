export type PersonalInfoFormValues = {
  fullName: string;
  phone: string;
};

export type ProfileUpdatePayload = {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
};
