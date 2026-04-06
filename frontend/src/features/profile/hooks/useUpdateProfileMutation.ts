import { useMutation, useQueryClient } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile, profile);
    },
  });
};
