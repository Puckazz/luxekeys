import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ADMIN_USERS_QUERY_KEYS } from '@/features/admin/hooks/users.key';
import { profileApi } from '@/features/profile/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';
import { getAuthSession, updateAuthSessionUser } from '@/lib/auth-session';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile, profile);
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });

      const sessionUser = getAuthSession();

      if (sessionUser && sessionUser.id === profile.id) {
        updateAuthSessionUser({
          ...sessionUser,
          email: profile.email,
          name: profile.fullName,
          role: profile.role,
        });
      }
    },
  });
};
