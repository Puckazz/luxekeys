'use client';

import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/features/profile/hooks';
import type { PersonalInfoFormValues } from '@/features/profile/types';
import { ProfilePersonalInfoCard } from '@/features/profile/components/shared/ProfilePersonalInfoCard';

export default function PersonalInfoPage() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const profile = profileQuery.data;

  const onSubmit = async (values: PersonalInfoFormValues) => {
    await updateProfileMutation.mutateAsync(values);
  };

  return (
    <ProfilePersonalInfoCard
      profile={profile}
      description="Update your account profile information used across checkout and support."
      isSubmitting={updateProfileMutation.isPending}
      isSuccess={updateProfileMutation.isSuccess}
      errorMessage={updateProfileMutation.error?.message}
      onSubmit={onSubmit}
    />
  );
}
