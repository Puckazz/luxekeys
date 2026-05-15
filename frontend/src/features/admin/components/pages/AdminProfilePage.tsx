'use client';

import type { PersonalInfoFormValues } from '@/features/profile/types';
import { ProfilePersonalInfoCard } from '@/features/profile/components/shared/ProfilePersonalInfoCard';
import { useProfileQuery, useUpdateProfileMutation } from '@/features/profile/hooks';

export function AdminProfilePage() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const handleSubmit = async (values: PersonalInfoFormValues) => {
    await updateProfileMutation.mutateAsync(values);
  };

  return (
    <ProfilePersonalInfoCard
      profile={profileQuery.data}
      title="Admin Profile"
      description="Update your personal admin account information. Role and access permissions are managed separately."
      isSubmitting={updateProfileMutation.isPending}
      isSuccess={updateProfileMutation.isSuccess}
      errorMessage={updateProfileMutation.error?.message}
      onSubmit={handleSubmit}
    />
  );
}
