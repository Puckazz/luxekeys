import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';
import { useAddressesStore } from '@/stores/profile/addresses.store';

export const useAddressesQuery = () => {
  const setAddresses = useAddressesStore((state) => state.setAddresses);

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEYS.addresses,
    queryFn: profileApi.getAddresses,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) {
      setAddresses(query.data);
    }
  }, [query.data, setAddresses]);

  return query;
};
