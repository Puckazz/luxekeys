import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';
import { useProfileStore } from '@/stores/profile/profile.store';

export const useProfileQuery = () => {
  const setProfile = useProfileStore((state) => state.setProfile);

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: profileApi.getProfile,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
};
